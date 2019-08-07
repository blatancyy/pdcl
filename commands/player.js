exports.aliases = ['p'];
exports.run = (client, message, args) => {
    if (message.hub) return;
    if (!args.length) return message.channel.send("Please provide a player name.");

    // Configure league-specific attributes:
	let league = !args[1] ? message.league : args[1];
	if (!client.config.leagues.some(l => l.config.name == league)) return message.channel.send(`Couldn't find league ${league}`)
    let colour = client.leagueColours.get(league);

    // Find player: 
    let reqPlayer = client.escape(args[0].toLowerCase());
    let player = client.players[league].find((p) => p.displayname.toLowerCase().includes(reqPlayer));
    if (!player) return message.channel.send("Did not find player.");

	let team = client.teams[league].find((t) => t.id === player.team_id);

    // Construct the embed:
    let display;
    if (message.league == "mscl") display = `${client.msclGarbage.get(player.teamrank)}${client.escape(player.displayname)}${client.emojiMap.get(player.leaguerank)}`; 
    else display = `${client.escape(player.displayname)}${client.teamRankMap.get(player.teamrank)}${client.emojiMap.get(player.leaguerank)}`;

	const playerEmbed = new client.djs.RichEmbed()
		.setTitle(display)
		.setURL("https://club.mpcleague.com/players/${player.displayname}")
		.addField("Team", !team ? 'None' : team.name, true)
		.addField(`[KDR] Rating: ${player.kills / player.deaths}`, `${player.kills}/${player.deaths}`, true)
		.addField('League', league.toUpperCase(), true)
		.setColor(colour)
		.setTimestamp();

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