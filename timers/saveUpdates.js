exports.time = 60000 * 30;
exports.run = (client) => {
	const db = client.databases.get("discord");
	
	//Fix the indentation how you want Fred. I'm morally obligated to never use brackets in one-lined if bodies.
	for (const entry of client.levelUpdates) {
		if (entry.type === 'newUser')
			db.execute(`INSERT INTO ${entry.table} (id, xp) VALUES ("${entry.id}", ${entry.xp})`)
				.catch(e => console.log(`[PDCL v3] Error whilst inserting new user int ${entry.table} in DB. \nError: ${e}`));
		else
			db.execute(`UPDATE ${entry.table} SET xp = xp + ${entry.xp} WHERE id = "${entry.id}";`)
				.catch(e => console.log(`[PDCL v3] Failed to update someone's XP | ID: ${entry.id} , XP: ${entry.xp}. \nError: ${e}.`));
	}
	client.levelUpdates = [];
	console.log('client.levelUpdates.length = ' + client.levelUpdates.length)
}