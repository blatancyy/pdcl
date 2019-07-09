exports.aliases = ["rankings", "leaderboard"];
exports.run = (client, message, args) => {
    if (!message.home) return;
    if (message.hub) return;


    let league = message.guild.id == "542848649202499584" ? "global" : message.league;
    let levels = client.levels[league];
    
    levels.sort((u1, u2) => u2.xp - u1.xp);
    let top10 = levels.slice(0, 10).map((u) => `<@${u.id}> | **Level: ${u.level}** | **Total XP: ${u.xp}**.`);
    
    let authorEntry = levels.find((u) => u.id === message.author.id);  
    let pos = levels.indexOf(authorEntry) + 1;
    let author = `<@${authorEntry.id}> | **Level: ${authorEntry.level}** | **Total XP: ${authorEntry.xp}**.`;    
    
	const levelsEmbed = new client.djs.RichEmbed()
	.setAuthor(message.author.tag, message.author.displayAvatarURL)
	.setDescription(`Your position is #${pos}/${levels.length}`)
    .addField(`Showing leaderboard for ${message.guild.name}.`, top10)
    .addField("Individual Stats", author)
    .setColor("BLUE")
    .setFooter("Global Cooldown of 15-25xp per message/minute!")
    .setTimestamp();

    message.channel.send({embed: levelsEmbed});
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Shows level leadboards.")
    .addField("Usage:", "`!levels`", true)
    .setColor("DARK_AQUA")
    .setFooter("!levels")
    .setTimestamp(); 

    message.channel.send({embed: helpEmbed});
}