exports.aliases = ['xp', 'level'];
exports.run = (client, message, args) => {
    if (message.hub) return;
    
	let mention = message.mentions.members.size > 0;
	let member;
	if (args.length > 0) member = message.guild.members.find(m => m.displayName.toLowerCase() == args.join(' ').toLowerCase() || m.user.username.toLowerCase() == args.join(' ').toLowerCase());
    let user = mention ? message.mentions.members.first().user : member ? member.user : message.author;

    // Community Discord ID
    let league = message.guild.id == "542848649202499584" ? "global" : message.league;
    let levels = client.levels[league];

    let levelData = levels.find((u) => u.id == user.id);
    if (!levelData) return message.channel.send("You are not ranked yet!");

	let xp = levelData.xp;
	let XPData = client.utils.get("calculateLevelData")(xp);
    let level = XPData.level;
    let rank = levels.sort((a, b) => b.xp - a.xp).indexOf(levelData) + 1;
    let xpToNext = (XPData.totalToNext - XPData.prevTotalToNext) - XPData.levelXP;
    
    // Format Embed:
    const rankEmbed = new client.djs.RichEmbed()
		.setAuthor(user.tag, user.displayAvatarURL)
		.setDescription(`Showing ${league == "global" ? "global" : "local"} level data for ${message.guild.name}.`)
		.addField("Level Info", `**Level ${level}** | **${XPData.levelXP}/${XPData.totalToNext - XPData.prevTotalToNext} XP** | **${xpToNext >= 1000 ? `${xpToNext / 1000}k` : xpToNext} XP** to next level\n**${XPData.totalXP >= 1000 ? `${XPData.totalXP / 1000}k` : XPData.totalXP}** total XP.`)
		.addField("Rank", `**${rank}/${levels.length}** Users`, true)
		.setColor("BLUE")
		.setFooter(message.guild.name, message.guild.iconURL)
		.setURL('https://www.thehappycatsite.com/wp-content/uploads/2017/12/grow.jpg')
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