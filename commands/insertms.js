exports.run = async (client, message, args) => {
	
	let formattedRows = await client.utils.get('processStats')(message.content);

	message.channel.send(`Be sure to review ?insertms before using this command.\nAre you sure you want to continue? (reply yes/no)`)
	let confirmation = await message.channel.awaitMessages(msg => msg.author.id == message.author.id, { max: 1, time: 120000, errors: ['time'] })
		.catch(() => message.channel.send('Aborting stat insert (time ran out)'));
	
	if (confirmation.first().content.toLowerCase() != 'yes') return message.channel.send('Aborting stat insert (user cancelled)')
	// Insert into DB
	console.log('Name | Kills | Deaths\n' + formattedRows.map(r => `${r.name} | ${r.kills} | ${r.deaths}`).join('\n'));
}