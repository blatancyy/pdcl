module.exports = async(client, content) => {
    let db = client.databases.get("mscl");
	let rows = content.split('\n');

    rows.forEach(async(row) => {
        let args = row.split(" ");
        let ign = args[0];
        let elo = args[1];

        // https://api.mojang.com/users/profiles/minecraft/${name}?at=0 (.name)
        let response = await client.request_promise({url: `https://api.mojang.com/users/profiles/minecraft/${ign}?at=0`, json: true});
        if (!response) return console.log('Couldn\'t find a player by that name.');

        let uuid = response.uuid;
        let curIgn = await client.fetchUsername(client, uuid);

        await db.execute(`INSERT INTO ranked_s5 (displayname, uuid, elo) VALUES ("${curIgn}", "${uuid}", ${elo});`)
            .catch(console.error);

        console.log(`Successfully added player ${curIgn} to the ranked_s5 table with elo: ${elo}, and uuid: ${uuid}.`);
    });
}