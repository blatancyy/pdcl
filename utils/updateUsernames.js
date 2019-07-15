module.exports = async(client, players, dbInfo) => {
    let db = await createNewConnection(client, dbInfo.db);
    if (!db) return console.log(`Failed to create a new connection with db name: ${dbInfo.db}`);

    console.log(players);

    players.forEach((player) => {
        let current = player.displayname;
        let uuid = clean(player.uuid);
        if (!uuid) return console.log(`[PDCL v3][UPDATE USERNAMES] Was supplied an invalid UUID: ${uuid}`);

        client.request.get({url: `https://api.mojang.com/user/profiles/${uuid}/names`, json: true}, (e, r, b) => {
            if (!b) return console.log(`[PDCL v3][UPDATE USERNAMES] Didn't receive a response w/ UUID: ${uuid}.`);
            if (b.constructor.name !== "Array") return console.log(b);

            let updated = b.pop().name;
            console.log("after mojang request" + updated);
            if (current == updated) return;
            console.log("after check if same")

            console.log(`[QUERY] UPDATE ${dbInfo.table} SET displayname = "${updated}" WHERE displayname = "${current}";`)
            db.execute(`UPDATE ${dbInfo.table} SET displayname = "${updated}" WHERE displayname = "${current}";`).catch(e => console.log(e));

            console.log(`[PDCL v3][UPDATE USERNAMES] Successfully updated username in league: ${dbInfo.db} for ${dbInfo.table}, : ${current} --> ${updated}.`);
        });
    });
}

const clean = (uuid) => {
    if (typeof(uuid) !== "string") return false;
    return uuid.replace(/-/g, "");
}

const createNewConnection = async(client, database) => {
	const connection = await client.mysql.createPool({
		connectionLimit: 100,
		host: "localhost", 
		user: client.config.credentials.mysql.username,
		password: client.config.credentials.mysql.password,
		database: database
	});

	await connection.getConnection().catch(e => console.log(`[PDCL v3][UPDATE USERNAMES] Failed to establish new connection: \n${e}`));
	return Promise.resolve(connection);
}
