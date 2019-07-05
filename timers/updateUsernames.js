exports.run = async(client) => {
    client.config.leagues.forEach(async(league) => {
        let name = league.config.name;
        let players = client.players[name];

        // Make a new db connection to not exceed connectionLimit:
        let db = await createNewConnection(client, league.config.database);
        if (!db) return console.log(`[PDCL v3][UPDATE USERNAMES] Failed to create new connection for ${name}.`);

        console.log(`[PDCL v3][UPDATE USERNAMES] Created new database for: ${name}.`);

        players.forEach((player) => {
            let current = player.displayname;
            let uuid = clean(player.uuid);
            if (!uuid) return console.log(`[PDCL v3][UPDATE USERNAMES] Was supplied an invalid UUID: ${uuid}`);

            client.request.get({url: `https://api.mojang.com/user/profiles/${uuid}/names`, json: true}, (e, r, b) => {
                if (!b) return console.log(`[PDCL v3][UPDATE USERNAMES] Didn't receive a response w/ UUID: ${uuid}.`);
                if (b.constructor.name !== "Array") return console.log(`[PDCL v3][UPDATE USERNAMES] Response is not an array: ${b}`);

                let updated = b.pop().name;
                if (current == updated) return;

                console.log(`[QUERY] UPDATE players SET displayname = "${updated}" WHERE displayname = "${current}";`)
				db.execute(`UPDATE players SET displayname = "${updated}" WHERE displayname = "${current}";`).catch(e => console.log(e));

                console.log(`[PDCL v3][UPDATE USERNAMES] Successfully updated username in league: ${name}, : ${current} --> ${updated}.`);
            });
        });
    });
}

const clean = (uuid) => {
    if (typeof(uuid) !== "string") return false;
    return uuid.replace(/-/g, "");
}

const createNewConnection = async (client, database) => {
    return new Promise((resolve) => {
        const connection = client.mysql.createPool({
            connectionLimit: 100,
            host: "localhost",
            user: client.config.credentials.mysql.username,
            password: client.config.credentials.mysql.password,
            database: database
        });

        connection.getConnection((e) => {
            if (e) return console.log(`[PDCL v3][UPDATE USERNAMES] Failed to establish new connection: \n${e}`);
            resolve(connection);
        });
    });
}

exports.time = 60000 * 60 * 8;