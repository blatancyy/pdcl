
exports.run = async (client, message, args) => {
    if (!message.home) return;
    if (message.hub) return;

	let league = client.config.leagues.find((l) => l.config.id == message.guild.id);
	if (!league) return;
	let db = client.databases.get(league.config.name);

	const [rows, fields] = await db.execute(`SELECT * FROM ${league.config.ranked.table} ORDER BY elo DESC LIMIT 15;`);

	let elos = rows.map(row => `**${row.displayname}** | **Elo:** ${row.elo}, ${row.kills != 0 && row.deaths != 0 ? `**KDR:** ${(row.kills / row.deaths).toFixed(3)}, ` : ''} **Wins:** ${row.wins}, **Losses:** ${row.losses}**`);
	
	// Some day if Discord accounts are linked with MC IGNs we can use this.
    // let authorEntry = elos.find((u) => u.id === message.author.id);  
    // let pos = elos.indexOf(authorEntry) + 1;
    // let author = `<@${authorEntry.id}> | **Level: ${client.calculateLevelData(authorEntry.xp).level}** | **Total XP: ${authorEntry.xp > 1000 ? authorEntry.xp / 1000 + "k" : authorEntry.xp}**.`;    
    
	const levelsEmbed = new client.djs.RichEmbed()
	.setAuthor(message.author.tag, message.author.displayAvatarURL)
	// .setDescription(`Rank #${pos}/${elos.length}.`)
    .addField(`Showing ranked leaderboard for ${message.guild.name}.`, elos)
    // .addField("Individual Stats", author)
    .setColor("BLUE")
    .setFooter("Global Cooldown of 15-25xp per message/minute!")
    .setTimestamp();

    message.channel.send({embed: levelsEmbed});
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Shows ranked leadboard.")
    .addField("Usage:", "`!leaderboard`", true)
    .setColor("DARK_AQUA")
    .setFooter("!leaderboard")
    .setTimestamp(); 

    message.channel.send({embed: helpEmbed});
}