module.exports = async(client) => {
	let db = client.databases.get("mscl");
	const [rows, fields] = await db.execute(`SELECT * FROM ranked_s5 ORDER BY elo DESC LIMIT 40`);

	for (const row of rows) {
		client.msclElos.set(row.displayname, (5 - Math.ceil(rows.indexOf(row) + 1 / 10.0)) * 75);
	}
}