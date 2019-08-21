module.exports = async(client) => {
	let db = client.databases.get("mscl");
	const [rows, fields] = await db.execute(`SELECT * FROM ranked_s6`);
	rows.sort((p1, p2) => p2.elo - p1.elo);
	
	for (const row of rows) {
		let elo = (5 - (Math.ceil((rows.indexOf(row) + 1) / 10))) * 75;
		client.lastSeasonElos.set(row.displayname, elo);
	}

	const [rows2, fields2] = await db.execute(`SELECT * FROM ranked_s7;`);

	for (const row2 of rows2) {
		client.msclElos.set(row2.displayname, row2.elo);
	}
}
