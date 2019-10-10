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

	let elo = args[1];
	if (!elo) return message.channel.send("Please provide +/-(elo) e.g +50, -30.");
	if (isNaN(elo)) return message.channel.send("Please provide a number.");

	let wins = args[2];
	if (!wins) wins = "+0";
	if (isNaN(wins)) return message.channel.send("Please provide a number.");

	let losses = args[3];
	if (!losses) losses = "+0";
	if (isNaN(losses)) return message.channel.send("Please provide a number.");

	// Using +(elo) to make sure it's a number.
	let newElo = playerElo.swcl + (+elo); 
	playerElo.swcl = newElo;
	client.playerElos.set(player, playerElo);

	var e = false;
	await db.execute(`UPDATE ${table} SET elo = ${newElo}, wins = wins + ${wins}, losses = losses + ${losses}, games_played = wins + losses WHERE displayname = "${player}";`).catch((e) => {
		console.log(`Error whilst updating someone's elo: ${e}.`);
		message.channel.send("Something went wrong. Error has been logged to the console.");
		e = true;
	});
	
	if (!e)	message.channel.send(`Successfully adjusted ${player}'s elo to ${newElo}, from ${newElo - elo}, ${wins} wins, ${losses} losses.`);	
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Adjust a player's SWCL ranked stats.")
    .addField("Usage:", "`!addstats <IGN> <±amount of elo> <wins to add> <losses to add>`")
    .setColor("DARK_AQUA")
    .setFooter("!addstats")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}