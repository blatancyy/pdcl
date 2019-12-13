exports.run = async(client, message, args) => {
    if (!message.home) return console.log('is not a home guild');
	if (message.hub) return console.log('is a hub channel');
	
	// const discordDB = client.databases.get('discord');
	// const [signups, fields] = await discordDB.execute(`SELECT * FROM ranked_signups WHERE discord_id = "${message.author.id}" AND season = "${league.config.ranked.table}" AND league = "${message.league.id}";`)
	// 	.catch(e => console.error(e));
	// if (signups.length > 0) return message.channel.send(`You've already signed up an account for ranked this season.`);

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
	
	await discordDB.execute(`INSERT INTO ranked_signups (discord_id, season, league_id) VALUES ("${message.author.id}", "${league.config.ranked.table}", "${message.league.id}");`)
		.catch(e => console.error(e));
	if (!client.players[league.config.name].some(p => p.displayname.toLowerCase().includes(username.toLowerCase()))) {
		await db.execute(`INSERT INTO players (displayname, uuid, team_id) VALUES ("${username}", "${uuid}", 0);`);
		client.players[league.config.name].push({ displayname: username, uuid, region: 0, team_id: 0, teamrank: 0, leaguerank: 0, kills: 0, deaths: 0, rating: 0, blacklisted: 0, token: null, games_played: 0 });	
	}
	
	let playerElo = client.playerElos.get(username);
	if (!playerElo) {
		client.playerElos.set(username, {});
		playerElo = client.playerElos.get(username);
	}
	playerElo[league.config.name] = startingElo;
	message.member.setNickname(username, 'Auto-set when signing up for ranked.');
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