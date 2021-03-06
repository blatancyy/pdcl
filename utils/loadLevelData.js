// Called in ./listeners/ready.js 
module.exports = async(client) => {
	const db = await client.getDatabasePromise(client, "discord");

	let names = [];
	// League Discords:
	for (const league of client.config.leagues) {
		let table = league.config.level_table;
		let name = league.config.name;
		if (name == "community") continue;		

		const [rows, fields] = await db.execute(`SELECT * FROM ${table}`)
			.catch(e => console.log(`[PDCL v3] Error whilst loading local xp for ${name}. \nError: ${e}`));

		client.levels[name] = [];
		for (const row of rows) row.level = client.calculateLevelData(row.xp).level;
			
		client.levels[name] = rows;
		client.levels[name].sort((a, b) => b.xp - a.xp);
		names.push(name);
	};

	console.log(`[PDCL v3] Loaded local xp data for leagues: ${names.map(n => n).join(', ')}.`)
	
	const [rows, fields] = await db.execute('SELECT * FROM global_levels')
		.catch(e => console.log(`[PDCL v3] Error whilst loading global levels. \nError: ${e}`));

	client.levels.global = [];
	for (const row of rows) row.level = client.calculateLevelData(row.xp).level;
		
	client.levels.global = rows;
	client.levels.global.sort((a, b) => b.xp - a.xp);
}