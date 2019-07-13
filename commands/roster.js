exports.aliases = ['r', 'team'];
exports.run = (client, message, args) => {
    if (message.hub) return;
    if (!args.length) return message.channel.send("Please provide a team name.");

    // Configure league-specific attributes:
    let league = message.league;
    let colour = client.leagueColours.get(league);

    // Find roster data:
    let reqTeam = args[0].toLowerCase();
    let team = client.teams[league].find((t) => t.name.toLowerCase().includes(reqTeam));
    if (!team) return message.channel.send("Did not find team.");

    let pool = client.teams[league];
    let rank = pool.sort((team1, team2) => team2.elo - team1.elo).indexOf(team) + 1;

    let players = client.players[league].filter((p) => p.team_id === team.id);
    if (!players.length > 0) return message.channel.send("Did not find team.");

    // Sort players:
    const roster = players.sort((p1, p2) => p2.teamrank - p1.teamrank).map((player) => {
        if (league == "mscl") return `${client.msclGarbage.get(player.teamrank)}${client.escape(player.displayname)}${client.emojiMap.get(player.leaguerank)}`;
        return `${client.escape(player.displayname)}${client.teamRankMap.get(player.teamrank)}${client.emojiMap.get(player.leaguerank)}`;
    }); 

    // Construct embed:
    const rosterEmbed = new client.djs.RichEmbed()
    .setTitle(team.name)
    .setDescription(`Rank: ${rank} | Region: ${team.region}`)
    .setURL(`https://club.mpcleague.com/switchleagues/${league}?redirect=/roster/${encodeURIComponent(team.name)}`)
    .setColor(colour);

    // \u200b is just an empty character w/ 0 width, needed bc field values cannot be empty.
    rosterEmbed.addField("Roster", roster.slice(0, 10).join("\n"), true);
    if (roster.length > 10) rosterEmbed.addField("\u200b", roster.slice(10, 20).join("\n"), true)
    if (roster.length > 20) rosterEmbed.addField("\u200b", roster.slice(20, 30).join("\n"), true)

    message.channel.send({embed: rosterEmbed});        
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "View information about a team.")
    .addField("Usage:", "`!roster <name>`", true)
    .addField("Example", "`!roster Serpentine`", true)
    .setColor("DARK_AQUA")
    .setFooter("!roster")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}