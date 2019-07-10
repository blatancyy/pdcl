// Called in ./listeners/ready.js 
module.exports = (client) => {
	const db = await client.utils.get("getDatabasePromise")(client, "discord");

	// League Discords:
	client.config.leagues.forEach(async (league) => {
		let table = league.config.level_table;
		let name = league.config.name;
		if (name == "community") return;

		console.log(`[PDCL v3] Beginning to load local xp data for league: ${name}.`)

		const [rows, fields] = await db.execute(`SELECT * FROM ${table}`)
			.catch(e => console.log(`[PDCL v3] Error whilst loading local xp for ${name}. \nError: ${e}`));

		client.levels[name] = [];
		for (const row of rows) row.level = client.utils.get("calculateLevelData")(row.xp).level;
			
		client.levels[name] = rows;
		client.levels[name].sort((a, b) => b.xp - a.xp);
	});
	
	const [rows, fields] = await db.execute('SELECT * FROM global_levels')
		.catch(e => console.log(`[PDCL v3] Error whilst loading global levels. \nError: ${e}`));

	client.levels.global = [];
	for (const row of rows) row.level = client.utils.get("calculateLevelData")(row.xp).level;
		
	client.levels.global = rows;
	client.levels.global.sort((a, b) => b.xp - a.xp);
}