exports.run = async(client, message, args) => {
    if (!message.home) return console.log('is not a home guild');
    if (message.hub) return console.log('is a hub channel');
    
    let league = client.config.leagues.find((l) => l.config.id == message.guild.id);
	if (!league.config.ranked.status) return console.log('not ranked : ' + league.config.name);

	let db = client.databases.get(league.config.name);

    if (args.length == 0) return message.channel.send("Please provide a UUID.");
    let uuid = args[0];
    let username = await client.fetchUsername(client, uuid);
    if (!username) return message.channel.send("Failed to fetch your username.");

    const [players, fields] = await db.execute(`SELECT * FROM ${league.config.ranked.table}`);
    let player = players.find((p) => p.displayname.toLowerCase() == username.toLowerCase());
    if (player) return message.channel.send("Already found this UUID in the database, will not duplicate.");

	let playerSElo = client.playerStartingElo.get(username);
	let startingElo = playerSElo && playerSElo[league.config.name] ? playerSElo[league.config.name] : 0;

    message.channel.send(`Signed up player: ${username} w/ a starting elo of: ${startingElo}. \nIs this info wrong? Let @ Snowful#1513 know.`);
    
    let table = league.config.ranked.table;
	await db.execute(`INSERT INTO ${table} (displayname, uuid, elo) VALUES ("${username}", "${uuid}", ${startingElo});`).catch(console.error);
	
	let playerElo = client.playerElos.get(username);
	if (!playerElo) playerElo = {};
	playerElo[league.config.name] = startingElo;
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