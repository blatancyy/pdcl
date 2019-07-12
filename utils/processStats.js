module.exports = async (data) => {
	
	let rows = data.split('\n');
	// Remove map name and first team name.
	rows.shift();
	rows.shift();
	// so elegant

	let formattedRows = [];
	for (let row of rows) {
		if (row.startsWith('!')) row = row.slice(row.indexOf(' ') + 1);
		if (!row.includes('-')) continue; // Ignore the second team name
		
		let name = row.split(' ')[0];
		let kills = row.split(' ')[1].split('-')[0];
		let deaths = row.split(' ')[1].split('-')[1];

		formattedRows.push({name, kills, deaths});
	}
	return formattedRows;
}