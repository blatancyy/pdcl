exports.aliases = ['elo'];
exports.run = async(client, message, args) => {
	// Idk what this is in the config so you can fix this fred >.> lol nw
	let league = client.config.leagues.find((l) => l.config.id == message.guild.id);
	if (!league.ranked.status) return;
	if (!league.ranked.stats.includes(message.author.id)) return;

	let table = league.ranked.table
	const db = client.databases.get(league);

	let player = args[0];
	if (!player) return message.channel.send("Please provide a player name, case-sensitive.");
	let foundElo = client.msclElos.get(player);
	if (!foundElo) return message.channel.send(`Couldn't find player: ${player}, check the case-sensitivity.`);

	let elo = args[1];
	if (!elo) return message.channel.send("Please provide an amount of add or subtract.");
	if (isNaN(elo)) return message.channel.send("Please provide a number.");

	// Using +(elo) to make sure it's a number.
	let newElo = foundElo + +(elo); 
	client.msclElos.set(player, newElo);
	await db.execute(`UPDATE ${table} SET elo = ${newElo} WHERE displayname = "${player}";`).catch((e) => {
		if (e) {
			console.log(`Error whilst updating someone's elo: ${e}.`);
			return message.channel.send("Something went wrong. Error has been logged to the console.");
		} else {			
			message.channel.send(`Successfully adjusted ${player}'s elo to ${newElo}, from ${foundElo}.`);
		}
	});
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Add to or subtract from a player's elo.")
    .addField("Usage:", "`!elo <IGN> <±amount of elo>`")
    .setColor("DARK_AQUA")
    .setFooter("!elo")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}