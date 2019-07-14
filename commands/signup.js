exports.run = async(client, message, args) => {
    if (!message.home) return;
    if (message.hub) return;

    let db = client.databases.get(message.league);
    let league = client.config.leagues.find((l) => l.config.id == message.guild.id);
    if (!league.config.ranked.status) return;

    if (!args.length > 0) return message.channel.send("Please provide a UUID.");
    let uuid = args[0];
    let username = await client.fetchUsername(client, uuid);
    if (!username) return message.channel.send("Failed to fetch your username.");

    let elo = client.msclElos.get(username);
    let startingElo = elo ? elo : 0;

    message.channel.send(`Successfully found player: ${username}! Starting Elo: ${elo}. \nIs this info wrong? Let me know at @ fred#5775.`);
    
    let table = league.config.ranked.table;
    await db.execute(`INSERT INTO ${table} (displayname, uuid, elo) VALUES ("${username}", "${uuid}", ${startingElo});`).catch(console.error);
    console.log(`Successfully set ${username}'s (${uuid}) starting elo to ${startingElo}.`);
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Signup for a ranked season.")
    .addField("Usage:", "`!signup <uuid>`", true)
    .addField("Example", "`!signup c0dca1da-7a15-4d12-8006-603640a72846`", true)
    .setColor("DARK_AQUA")
    .setFooter("!signup")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}