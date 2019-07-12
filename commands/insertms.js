exports.run = async (client, message, args) => {
	
	let formattedRows = await client.utils.get('processStats')(message.content);

	message.channel.send(`Be sure to review ?insertms before using this command.\nAre you sure you want to continue? (reply yes/no)`)
	let confirmation = await message.channel.awaitMessages(msg => msg.author.id == message.author.id, { max: 1, time: 120000, errors: ['time'] })
		.catch(() => message.channel.send('Aborting stat insert (time ran out)'));
	
	if (!confirmation) return;
	if (confirmation.first().content.toLowerCase() != 'yes') return message.channel.send('Aborting stat insert (user cancelled)')
	// Insert into DB
	console.log('Name | Kills | Deaths\n' + formattedRows.map(r => `${r.name} | ${r.kills} | ${r.deaths}`).join('\n'));
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Insert ranked stats for a game. **NOTE:** you should copy/paste *all* of the export content (not just the names and stats).\nMake sure each player & their stats are on their own line (see example).")
    .addField("Usage:", "`!insertms <export content>`", true)
    .addField("Example:", "`!insertms MineStrike - Inferno\nSWAT 9\nname1 18-12 +6 0.0% 1.43\nname2 19-11 +8 5.3% 1.40\nname3 16-13 +3 12.5% 1.12\n" +
	"name4 8-12 -4 12.5% 0.69\nname5 8-15 -7 12.5% 0.62\nBombers 9\nname6 20-13 +7 0.0% 1.51\nname7 15-15 +0 6.7% 1.17\nname8 14-13 +1 14.3% 1.03\n" +
	"name9 10-13 -3 10.0% 0.83\nname10 4-15 -11 0.0% 0.35`", true)
    .setColor("DARK_AQUA")
    .setFooter("!insertms")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}