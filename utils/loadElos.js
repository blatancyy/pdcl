module.exports = async (client) => {
	
	for (const league in client.config.leagues) {
		let isRanked = league.config.ranked.status;
		if (!isRanked) continue;

		let table = league.config.ranked.table;
		let prevTable = league.config.ranked.prev_table;

		let db = client.databases.get(league.config.name);

		// Starting Elo
		if (prevTable) {
			const [rows, fields] = await db.execute(`SELECT * FROM ${prevTable}`);
			rows.sort((p1, p2) => p2.elo - p1.elo);
			
			for (const row of rows) {
		
				let elo = (5 - (Math.ceil((rows.indexOf(row) + 1) / 10))) * 75;
				if (elo < 0) elo = 0;
				else if (elo > 300) elo = 300;
		
				let playerSElo = client.playerStartingElo.get(row.displayname);
				if (!playerSElo) playerSElo = {};

				playerSElo[league.config.name] = elo;
				client.playerStartingElo.set(row.displayname, playerSElo);
			}
		}
	
		// Elo this season
		const [rows, fields] = await db.execute(`SELECT * FROM ${table};`);
	
		for (const row of rows) {
			let playerElo = client.playerElo.get(row.displayname);
			if (!playerElo) playerElo = {};

			playerElo[league.config.name] = row.elo;
			client.playerElos.set(row.displayname, playerElo);
		}
	}	
}
