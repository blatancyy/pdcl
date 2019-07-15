module.exports = async(client, content) => {
    let db = client.databases.get("mscl");
	let rows = content.split('\n');

    rows.forEach(async(row) => {
        let args = row.split(" ");
        let ign = args[0];
        let uuid = args[1];
        let elo = args[2];

        await db.execute(`INSERT INTO ranked_s5 (displayname, uuid, elo) VALUES ("${ign}", "${uuid}", ${elo});`)
            .catch(console.error);

        console.log(`Successfully added player ${ign} to the ranked_s5 table with elo: ${elo}, and uuid: ${uuid}.`);
    });
}