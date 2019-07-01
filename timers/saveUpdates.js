exports.time = 60000 * 30;
exports.run = (client) => {
	const db = this.databases.get("discord");
	
	for (const entry of client.levelUpdates) {
		db.query(`UPDATE ${entry.table} SET xp = ${entry.xp} WHERE id = "${entry.id}";`)
	}
}