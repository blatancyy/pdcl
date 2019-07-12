exports.run = async (client, message, args) => {
	
	let formattedRows = await client.utils.get('processStats')(message.content);
	// Insert into DB
	console.log('Name | Kills | Deaths\n' + formattedRows.map(r => r).join('\n'));
}