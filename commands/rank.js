// !rank
exports.run = (client, message, args) => {
    if (message.hub) return;
    
    let mention = message.mentions.members.size > 0;
    let user = mention ? message.mentions.members.first().user : message.author;

    // Community Discord ID
    let league = message.guild.id == "542848649202499584" ? "global" : message.league;
    let levels = client.levels[league];

    let levelData = levels.find((u) => u.id == user.id);
    let xp = levelData.xp;
    let level = levelData.level;
    let rank = levelData.sort((a, b) => b.xp - a.xp).indexOf(levelData) + 1;

    // Format Embed:
    const rankEmbed = new client.djs.RichEmbed()
    .setAuthor(user.tag, user.displayAvatarURL)
    .setDescription(`Showing ${league == "global" ? "global" : "local"} level data.`)
    .addField("Rank:", `#${rank}/${levelData.length}`, true)
    // Can easily format the level and total xp, how to calculate the xp until the next level?
    .addField("Level Info", `Level ${level} | XP xxx/xxxx`)
    .setColor("Your first choice of colours, make it a good one.")
    .setTimestamp();

    message.channel.send({embed: rankEmbed});
}

const calculateLevel = (xp) => {
    let level = 0;
    let totalToNext = 5 * Math.pow(level, 2) + 50 * level + 100;
    let prevXPNeeded = 0;

    while (totalXP >= totalToNext) {
        level++;
        prevXPNeeded = totalToNext;
        totalXP -= totalToNext;
        totalToNext += 5 * Math.pow(level, 2) + 50 * level + 100;
    }

    return level;
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