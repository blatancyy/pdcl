exports.time = 60000 * 60 * 2;
exports.run = async(client) => {
	for (const league of client.config.leagues) {
        let ranked = league.config.ranked.status;        
        let database = league.config.name;
		
		client.updateUsernames(client, client.players[league.config.name], { db: database, table: "players"});
        console.log(`Successfully updated player usernames for ${league.config.name.toUpperCase()}.`);

		if (ranked) {
			let rankedTable = league.config.ranked.table;

            const db = client.databases.get(league.config.name);
            const [rows, fields] = await db.execute(`SELECT * FROM ${rankedTable};`);
            
            client.updateUsernames(client, rows, { db: database, table: rankedTable });
            console.log("Successfully updated player usernames for ${league.config.name.toUpperCase()} for RANKED.");
        }
        
        await client.wait(1000 * 60 * 15);
	}
}
