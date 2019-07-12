exports.aliases = ['insert']
exports.run = async (client, message, args) => {
	let rows = message.content.split('\n');
	let formattedRows = [];
	for (let row of rows) {
		if (row.startsWith('!')) row = row.slice(row.indexOf(' '));
		let name = row.split(' ')[0];
		let kills = row.split(' ')[1].split('-')[0];
		let deaths = row.split(' ')[1].split('-')[1];
		// Now we can do whatever we want with these values, like insert to DB.
		formattedRows.push(`${name} | ${kills} | ${deaths}`);
	}
	console.log('Name | Kills | Deaths\n' + formattedRows.map(r => r).join('\n'))
}