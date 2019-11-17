module.exports = async(client, players, dbInfo) => {
	let db = client.databases.get(dbInfo.db);
    if (!db) return console.log(`Failed to create a new connection with db name: ${dbInfo.db}`);

    players.forEach((player) => {
        let current = player.displayname;
        let uuid = clean(player.uuid);
        if (!uuid) return console.log(`[PDCL v3][UPDATE USERNAMES] Was supplied an invalid UUID: ${uuid}`);

		client.request.get({ url: `https://api.mojang.com/user/profiles/${uuid}/names`, json: true }, (e, r, b) => {
			if (e) return console.log(`[PDCL v3][UPDATE USERNAMES] Error on get request resolve: ${e}`)
            if (!b) return console.log(`[PDCL v3][UPDATE USERNAMES] Didn't receive a response w/ UUID: ${uuid}.`);
			if (b.constructor.name !== "Array") {
				console.log(`Not an array:`)
				return console.log(b);
			}

            let updated = b.pop().name;
            if (current == updated) return;

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