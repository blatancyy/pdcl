exports.run = (client, message, args) => {
    if (message.hub) return;
    
    let mention = message.mentions.members.size > 0;
    let user = mention ? message.mentions.members.first().user : message.author;

    // Community Discord ID
    let league = message.guild.id == "542848649202499584" ? "global" : message.league;
    let levels = client.levels[league];

    let levelData = levels.find((u) => u.id == user.id);
	let xp = levelData.xp;
	let XPData = client.calculateLevelData(xp);
    let level = XPData.level;
    let rank = levelData.sort((a, b) => b.xp - a.xp).indexOf(levelData) + 1;

    // Format Embed:
    const rankEmbed = new client.djs.RichEmbed()
    .setAuthor(user.tag, user.displayAvatarURL)
    .setDescription(`Showing ${league == "global" ? "global" : "local"} level data.`)
    .addField("Rank:", `#${rank}/${levelData.length}`, true)
    // Can easily format the level and total xp, how to calculate the xp until the next level?
    .addField("Level Info", `Level ${level} | ${XPData.totalXP}/${XPData.totalToNext - XPData.prevTotalToNext} XP | ${(XPData.totalToNext - XPData.prevTotalToNext) - XPData.totalXP} XP to next level`)
    .setColor("BLUE")
    .setTimestamp();

    message.channel.send({embed: rankEmbed});
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Shows level information.")
    .addField("Usage:", "`!rank (@user)`", true)
    .addField("Example:", "`!rank`", true)
    .setColor("DARK_AQUA")
    .setFooter("!rank")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}