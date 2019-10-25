exports.aliases = ['as']
exports.run = async (client, message, args) => {
	let league = client.config.leagues.find((l) => l.config.id == message.guild.id);
	if (!league.config.ranked.status) return;
	if (!league.config.ranked.stats.includes(message.author.id)) return;

	let table = league.config.ranked.table;
	const db = client.databases.get(message.league);

	const reqPlayers = args.slice(1, args.length);
	const win = ['win', 'won', 'w'].some(e => args[0].toLowerCase() === e);
	let players = [];
	
	for (const req of reqPlayers) {
		
		// Find player: 
		let player = client.players[league.config.name].find((p) => p.displayname.toLowerCase() === req.toLowerCase());
		if (!player) player = client.players[league.config.name].find((p) => p.displayname.toLowerCase().includes(req.toLowerCase()));
		if (!player) {
			message.channel.send(`WARNING: Didn't find player ${req} (double check spelling). Continuing...`);
			continue;
		}

		let playerElo = client.playerElos.get(player.displayname);
		if (!playerElo) {
			message.channel.send(`Couldn't find ranked elo for ${player.displayname}, check the case-sensitivity.`);
			continue;
		}

		let eloGain = await getEloGain(playerElo, win);

		players.push({ displayname: player.displayname, eloGain, playerElo });
				
	}

	if (players.length > 0) message.channel.send(`**CONFIRMATION** - About to make the following changes: \n**${players.map(p => `${p.displayname}: add ${p.eloGain} elo, +1 ${win ? 'win': 'loss'}`).join('\n')}**\nReply with 'yes' to confirm, anything else to cancel.`);

	let confirmation = await message.channel.awaitMessages((msg) => msg.author.id == message.author.id, { max: 1, time: 120000, errors: ['time'] })
		.catch(() => message.channel.send('Aborting stats insert. Time ran out'));
	
    if (!confirmation) return;
	if (confirmation.first().content.toLowerCase() != 'yes') return message.channel.send('Aborting stats insert. User cancelled.');
	
	for (const toAdd of players) {

		toAdd.playerElo.swcl += toAdd.eloGain;
		client.playerElos.set(toAdd.displayname, toAdd.playerElo);

		await db.execute(`UPDATE ${table} SET elo = elo + ${toAdd.eloGain}${win ? `, wins = wins + 1` : `, losses = losses + 1`}, games_played = wins + losses WHERE displayname = "${toAdd.displayname}";`).catch((e) => {
			console.log(`Error whilst updating ${toAdd.displayname}'s elo: ${e}.`);
			message.channel.send("Something went wrong saving to the DB. Ping Snow .o.");
		});
	}
	message.channel.send(`Successfully adjusted: \n**${players.map(p => `${p.displayname}: added ${p.eloGain} elo, +1 ${win ? 'win': 'loss'}`).join('\n')}**\nUse !player to see total stats`);
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Adjust a player's SWCL ranked stats.")
    .addField("Usage:", "`!addstats <IGN> <±amount of elo> <wins to add> <losses to add>`")
    .setColor("DARK_AQUA")
    .setFooter("!addstats")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}

const getEloGain = async (playerElo, win = true) => {


	if (!playerElo.swcl) playerElo.swcl = 0;
	if (!!win)
		return playerElo.swcl >= 900 ? 10 : playerElo.swcl >= 750 ? 15 : playerElo.swcl >= 550 ? 20 : playerElo.swcl >= 350 ? 25 : 30;
	else
		return playerElo.swcl >= 750 ? -20 : playerElo.swcl >= 550 ? -15 : playerElo.swcl >= 350 ? -15 : playerElo.swcl >= 100 ? -10 : 0;
}