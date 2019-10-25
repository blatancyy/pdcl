

exports.run = async (client, message, args) => {
	let league = client.config.leagues.find((l) => l.config.id == message.guild.id);
	if (!league.config.ranked.status) return;
	if (!league.config.ranked.stats.includes(message.author.id)) return;

	let table = league.config.ranked.table;
	const db = client.databases.get(message.league);

	const reqPlayers = args.slice(1, args.length);
	const win = ['win', 'won', 'w'].some(e => args[0].toLowerCase() === e) ? true : false;
	let players = [];
	
	for (const req of reqPlayers) {
		// Find player: 
		// let player = client.players[league.config.name].find((p) => p.displayname.toLowerCase() === req);
		// if (!player) player = client.players[league.config.name].find((p) => p.displayname.toLowerCase().includes(req));
		// if (!player) {
	// 	message.channel.send(`WARNING: Didn't find player ${req} (double check spelling). Continuing...`);
	// 	continue;
	// }

		// let playerElo = client.playerElos.get(player.displayname);
		// if (!playerElo) {
	// 	message.channel.send(`Couldn't find ranked elo for ${player.displayname}, check the case-sensitivity.`);
	// 	continue;
	// }
		let player = { displayname: req }
		let playerElo = {swcl: 0}

		let eloGain = getEloGain(playerElo.swcl, win);
		playerElo.swcl = eloGain;
		if (eloGain == 0) continue;
		client.playerElos.set(player.displayname, playerElo);

		players.push({ displayname: player.displayname, eloGain });
				// ***TEMP TABLE: REPLACE WITH ${table}***
		await db.execute(`UPDATE ranked_test SET elo = elo + ${eloGain}${win ? `, wins = wins + 1` : `, losses = losses + 1`}, games_played = wins + losses WHERE displayname = "${player.displayname}";`).catch((e) => {
			console.log(`Error whilst updating someone's elo: ${e}.`);
			message.channel.send("Something went wrong saving to the DB. Ping Snow .o.");
		});
	}

	if (players.length > 0) message.channel.send(`Successfully adjusted [${players.map(p => `${p.displayname}: added ${p.eloGain} elo, +1 ${win ? 'win': 'loss'}`).join(', ')}].\nUse !player to see total stats`);
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
	if (win)
		return playerElo.swcl >= 900 ? 10 : playerElo.swcl >= 750 ? 15 : playerElo.swcl >= 550 ? 20 : playerElo.swcl >= 350 ? 25 : 30;
	else
		return playerElo.swcl >= 750 ? -20 : playerElo.swcl >= 550 ? -15 : playerElo.swcl >= 350 ? -15 : playerElo.swcl >= 150 ? -10 : 0;
}