exports.time = 60000 * 30;
exports.run = (client) => {
	const db = client.databases.get("discord");
	
	for (const entry of client.levelUpdates) {
		db.query(`UPDATE ${entry.table} SET xp = xp + ${entry.xp} WHERE id = "${entry.id}";`, (e) => {
			console.log(`[PDCL v3] Failed to update someone's XP | ID: ${entry.id} , XP: ${entry.xp}. \nError: ${e}.`);
		});
	}
}