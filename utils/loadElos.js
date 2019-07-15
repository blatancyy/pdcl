module.exports = async(client) => {
	let db = client.databases.get("mscl");
	const [rows, fields] = await db.execute(`SELECT * FROM ranked_s6`);

	for (const row of rows) {
		client.msclElos.set(row.displayname, row.elo);
	}
}