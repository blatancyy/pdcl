exports.run = async (client) => {
    const db = client.databases.get("discord");
    client.globalUpdates = [];
    client.leagueUpdates = [];

    await new Promise((resolve) => {
        for (const league of client.config.leagues) {
            console.log(`Beginning to load Mee6 level data for ${league.config.name}.`);

            if (league.config.name == "community") continue;
            let id = league.config.id;
            let table = league.config.level_table;
            let url = `https://mee6.xyz/api/plugins/levels/leaderboard/${id}?page=0&limit=500`;
    
            client.request.get({ url: url, json: true }, async (e, r, b) => {                
                if (!b.players.length > 0) return console.log(`Received no response from mee6 api, using table: ${table}.`);
    
                for (const row of b.players) {
                    client.leagueUpdates.push({id: row.id, xp: row.xp, table: table});
    
                    let existingGlobal = client.globalUpdates.find((u) => u.id == row.id);
                    if (existingGlobal) existingGlobal.xp += row.xp;
                    else client.globalUpdates.push({id: row.id, xp: row.xp});
                }
            });
        }
        
        console.log("Finished looping for Mee6 level data.");
        resolve(client);
    });	

    console.log("Beginning to upload Mee6 level data.");

	for (const u of client.leagueUpdates) {
        db.execute(`INSERT INTO ${u.table} (id, xp) VALUES ("${u.id}", ${u.xp});`)
            .catch((e) => console.log(`Error whilst inserting new local mee6 levels into ${u.table}: \n${e}.`));
    }

	for (const u of client.globalUpdates) {
        db.execute(`INSERT INTO global_levels (id, xp) VALUES ("${u.id}", ${u.xp});`)
            .catch((e) => console.log(`Error whilst inserting new global mee6 levels into global_levels: \n${e}.`));
    }
}