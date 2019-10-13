exports.run = async(client, message, args) => {
	let league = client.config.leagues.find((l) => l.config.id == message.guild.id);
	if (!league.config.ranked.status) return;
	if (!league.config.ranked.stats.includes(message.author.id)) return;

	let table = league.config.ranked.table;
	const db = client.databases.get(message.league);

	let player = args[0];
	if (!player) return message.channel.send("Please provide a player name, case-sensitive.");
	let playerElo = client.playerElos.get(player);
	if (!playerElo) return message.channel.send(`Couldn't find player: ${player}, check the case-sensitivity.`);

	var e = false;
	await db.execute(`UPDATE ${table} SET elo = 0 WHERE displayname = "${player}";`).catch((e) => {
		console.log(`Error whilst updating someone's elo: ${e}.`);
		message.channel.send("Something went wrong. Error has been logged to the console.");
		e = true;
	});
	
	if (!e)	message.channel.send(`Successfully set ${player}'s elo to 0.`);	
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Set a player's elo to 0.")
    .addField("Usage:", "`!resetset <IGN>`")
    .setColor("DARK_AQUA")
    .setFooter("!addstats")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}