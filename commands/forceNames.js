exports.aliases = ["checknames", "names"];
exports.run = async(client, message, args) => {
    if (!message.home) return;
    if (message.hub) return;

    let league = client.config.leagues.find((l) => l.config.id == message.guild.id);
    if (!league) return console.log(`Failed to find config for league: ${message.guild.name}, yet it is a home guild?`);
    
    let role = message.guild.roles.find((r) => r.name.toLowerCase() == "management");
    if (!league.config.ranked.stats.includes(message.author.id) && !message.member.roles.has(role.id)) return;

    let ranked = league.config.ranked.status;         
    let rankedTable = league.config.ranked.table;
    let database = league.config.database;
    if (!ranked) return;    

    // owo
    message.channel.startTyping();

    const db = client.databases.get(league.config.name);
    const [rows, fields] = await db.execute(`SELECT * FROM ${rankedTable};`);
	await client.updateUsernames(client, rows, { db: database, table: rankedTable });
	await client.updateUsernames(client, client.players[league.config.name], { db: database, table: "players"});

    // Cheat method, please help me owo @snowful
    await client.wait(5000);

    console.log("Clearing all current elo data from the mscl elo map!")
    await client.playerElos.clear();
    await client.loadElos(client);

    message.channel.send(`Successfully forced the update username script for \`${rankedTable}\` in database: \`${league.config.name}\`.`);
    message.channel.stopTyping();
}