exports.time = 60000 * 60 * 2;
exports.run = async(client) => {
	for (const league of client.config.leagues) {
        let ranked = league.config.ranked.status;
        let rankedTable = league.config.ranked.table;
        let database = league.config.database;
		
		client.updateUsernames(client, client.players[league.config.name], { db: database, table: "players"})
        
        if (ranked) {
            const db = client.databases.get(league.config.name);
            const [rows, fields] = db.execute(`SELECT * FROM ${league.config.ranked.table};`)
            client.updateUsernames(client, rows, {db: database, table: rankedTable});
        }
        
        await client.wait(1000 * 60 * 15);
	}
}
