exports.run = async(client) => {
    client.config.leagues.forEach((league) => {
        let name = league.config.name;
        let players = client.players[name];
        let db = client.databases.get(name);

        players.forEach((player) => {
            let current = player.displayname;
            let uuid = clean(player.uuid);
            if (!uuid) return console.log(`[PDCL v3][UPDATE USERNAMES] Was supplied an invalid UUID: ${uuid}`);

            client.request.get({url: `https://api.mojang.com/user/profiles/${uuid}/names`, json: true}, (e, r, b) => {
                if (!b) return console.log(`[PDCL v3][UPDATE USERNAMES] Didn't receive a response w/ UUID: ${uuid}.`);
                
                let updated = b.pop().name;
                if (current == updated) return;

                console.log(`[QUERY] UPDATE players SET displayname = "${updated}" WHERE displayname = "${current}";`)
                db.query(`UPDATE players SET displayname = "${updated}" WHERE displayname = "${current}";`, (e) => {
                    if (e) return console.error(e)
                });

                console.log(`[PDCL v3][UPDATE USERNAMES] Successfully updated username in league: ${name}, : ${current} --> ${updated}.`);
            });
        });
    });
}

const clean = (uuid) => {
    if (typeof(uuid) !== "string") return false;
    return uuid.replace(/-/g, "");
}

exports.time = 60000 * 60 * 8;