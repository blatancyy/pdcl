exports.run = async (client) => {
    const db = client.databases.get("discord");
    const globalUpdates = [];
    const leagueUpdates = [];

    for (const league of client.config.leagues) {
        let id = league.config.id;
        let table = league.config.level_table;

        client.request.get({url: `https://mee6.xyz/api/plugins/levels/leaderboard/${id}?page=0&limit=500`, json: true}, (e, r, b) => {
            if (e) return console.error(e);
            let rows = b.players;

            rows.forEach((row) => {
                leagueUpdates.push({id: row.id, xp: row.xp, table: table});

                let existingGlobal = globalUpdates.find((u) => u.id == row.id);
                if (existingGlobal) existingGlobal.xp += row.xp;
                else globalUpdates.push({id: row.id, xp: row.xp});
            });
        });
    }

    for (const u of leagueUpdates) {
        db.execute(`INSERT INTO ${u.table} (id, xp) VALUES ("${u.id}", ${u.xp});`)
            .catch((e) => console.log(`Error whilst inserting new local mee6 levels into ${u.table}: \n${e}.`));
    }

    for (const u of globalUpdates) {
        db.execute(`INSERT INTO global_levels (id, xp) VALUES ("${u.id}", ${u.xp});`)
            .catch((e) => console.log(`Error whilst inserting new global mee6 levels into global_levels: \n${e}.`));
    }
}