exports.run = async (client, message, args) => {
    if (message.hub) return
    if (!args.length) return message.channel.send("Please provide a player name.");

	const rankedBanRoles = ["global", "leadership", "ranked ms organizer", "management", "developer"];

    var hasPerms = false;
    rankedBanRoles.forEach((name) => {
        let role = message.guild.roles.find((r) => r.name.toLowerCase() == name);
        if (role !== null && message.member.roles.has(role.id)) hasPerms = true;
    });

	if (!hasPerms) return;
	
    // Configure league-specific attributes:
	let league = client.config.leagues.find(l => l.config.name == (!args[1] ? message.league : args[1]));
	if (!league) return message.channel.send(`Couldn't find league.`);

    // Find player: 
    let reqPlayer = client.escape(args[0].toLowerCase());
    let player = client.players[league.config.name].find((p) => p.displayname.toLowerCase().includes(reqPlayer));
    if (!player) return message.channel.send("Did not find player.");

	let playerElo = client.playerElos.get(player.displayname);
	
	message.channel.send(`Player ${player.displayname} elo in ${league.config.name} is: ${playerElo[league.config.name]}`)
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "View player elo.")
    .addField("Usage:", "`!checkelo <ign>`", true)
    .addField("Example", "`!checkelo blatancyy`", true)
    .setColor("DARK_AQUA")
    .setFooter("!checkelo")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}
