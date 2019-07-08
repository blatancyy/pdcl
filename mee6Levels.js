exports.run = async (client) => {
    const db = client.databases.get("discord");
    const globalUpdates = [];
    const leagueUpdates = [];

	for (const league of client.config.leagues) {
		console.log(league.config.name)
        if (league.config.name == "community") continue;

        let id = league.config.id;
        let table = league.config.level_table;
        let url = `https://mee6.xyz/api/plugins/levels/leaderboard/${id}?page=0&limit=500`;

		client.request.get({ url: url, json: true }, (e, r, b) => {
			console.log(!!b.players)
            if (e) console.error(e);
            if (!b.players.length > 0) console.log(`Received no response from mee6 api, using table: ${table}.`);
			console.log('no errors')

			for (var row of b.players) {
                leagueUpdates.push({id: row.id, xp: row.xp, table: table});

                let existingGlobal = globalUpdates.find((u) => u.id == row.id);
                if (existingGlobal) existingGlobal.xp += row.xp;
                else globalUpdates.push({id: row.id, xp: row.xp});
            };
        });
    }
	console.log('Sup over here bro')
	for (const u of leagueUpdates) {
		console.log('HI')
        db.execute(`INSERT INTO ${u.table} (id, xp) VALUES ("${u.id}", ${u.xp});`)
            .catch((e) => console.log(`Error whilst inserting new local mee6 levels into ${u.table}: \n${e}.`));
    }

	for (const u of globalUpdates) {
		console.log('HI GLOBAL')
        db.execute(`INSERT INTO global_levels (id, xp) VALUES ("${u.id}", ${u.xp});`)
            .catch((e) => console.log(`Error whilst inserting new global mee6 levels into global_levels: \n${e}.`));
    }
}