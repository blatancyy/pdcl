exports.run = async (client, message, args) => {
	
	let formattedRows = client.utils.get('processStats')(message.content);
	console.log('Name | Kills | Deaths\n' + formattedRows.map(r => r).join('\n'));
}