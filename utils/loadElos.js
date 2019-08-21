module.exports = async (client) => {
	
	let db = client.databases.get("mscl");

	// Starting Elo
	const [rows, fields] = await db.execute(`SELECT * FROM ranked_s6`);
	rows.sort((p1, p2) => p2.elo - p1.elo);
	
	for (const row of rows) {
		console.log(row)
		// Need a clamp util
		let elo = Math.max(0, Math.min((5 - (Math.ceil((rows.indexOf(row) + 1) / 10))) * 75), 300);
		console.log(elo)
		client.lastSeasonElos.set(row.displayname, elo);
	}

	// Elo this season
	const [rows2, fields2] = await db.execute(`SELECT * FROM ranked_s7;`);

	for (const row2 of rows2) {
		client.msclElos.set(row2.displayname, row2.elo);
	}
}
