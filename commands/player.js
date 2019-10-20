exports.aliases = ['p'];
exports.run = async (client, message, args) => {
    if (message.hub) return
    if (!args.length) return message.channel.send("Please provide a player name.");

    // Configure league-specific attributes:
	let league = client.config.leagues.find(l => l.config.name == (!args[1] ? message.league : args[1]));
	if (!league) return message.channel.send(`Couldn't find league.`);
    let colour = client.leagueColours.get(league.config.name);

    // Find player: 
    let reqPlayer = client.escape(args[0].toLowerCase());
	let player = client.players[league.config.name].find((p) => p.displayname.toLowerCase().includes(reqPlayer));
	// if (!player) player = client.playerElos.get(Array.from(client.playerElos.keys()).find((name) => name.toLowerCase().includes(reqPlayer)));
	if (!player) return message.channel.send("Did not find player.");

	let team = client.teams[league.config.name].find((t) => t.id === player.team_id);

	// Ranked stuff
	let rankedStats = undefined;

	if (league.config.ranked.status) {
		let playerElo = client.playerElos.get(player.displayname);

		if (playerElo && playerElo[league.config.name] != undefined) {

			const db = client.databases.get(league.config.name);
			const [rows, fields] = await db.execute(`SELECT * FROM ${league.config.ranked.table} WHERE displayname = "${player.displayname}";`);

			if (rows.length != 0) rankedStats = `Elo: ${rows[0].elo}, ${rows[0].kills != 0 && rows[0].deaths != 0 ? `KDR: ${(rows[0].kills / rows[0].deaths).toFixed(3)}, ` : ''} Wins: ${rows[0].wins}, Losses: ${rows[0].losses}`;

		}
	}

    // Construct the embed:
    let display;
    if (message.league == "mscl") display = `${client.msclGarbage.get(player.teamrank)}${client.escape(player.displayname)}${client.emojiMap.get(player.leaguerank)}`; 
    else display = `${client.escape(player.displayname)}${client.teamRankMap.get(player.teamrank)}${client.emojiMap.get(player.leaguerank)}`;

	const playerEmbed = new client.djs.RichEmbed()
		.setTitle(display)
		.setURL("https://club.mpcleague.com/players/${player.displayname}")
		.addField("Team", !team ? 'None' : team.name, true)
		.addField(`[KDR] Rating: ${(player.kills / player.deaths).toFixed(3)}`, `${player.kills}/${player.deaths}`, true)
		.addField('League', league.config.name.toUpperCase(), true)
		.setColor(colour)
		.setTimestamp();
	if (rankedStats != undefined) playerEmbed.addField(`Ranked ${league.config.name.toUpperCase()}`, rankedStats, true)

    message.channel.send({embed: playerEmbed});
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "View information about a player.")
    .addField("Usage:", "`!player <ign>`", true)
    .addField("Example", "`!player blatancyy`", true)
    .setColor("DARK_AQUA")
    .setFooter("!player")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}