exports.aliases = ['elo'];
exports.run = (client, message, args) => {

	// Idk what this is in the config so you can fix this fred >.>
	if (["207896400539680778", "254728052070678529", "172823248860479488", "581945828235542548", "230520062337875969", "260514084305240064", "275302433335410688", "137364424775172097", "133277137607196673", "172855017999564800", "109119035072888832", "232281870501543938"]
		.some(id => id !== message.author.id)) return;

	let league = client.config.leagues.find((l) => l.config.id == message.guild.id);
	if (!league.ranked.status) return;
	let table = league.ranked.table
	const db = client.databases.get(league);
	
	if (!client.msclElos.has(args[0].toLowerCase())) return message.channel.send(`Couldn't find player ${args[0]}.`);
	if (isNaN(args[1])) return message.channel.send(`Elo needs to be a number.`);

	let elo = client.msclElos.get(args[0]);
	// Do we need to add to database too? I'm too tired
	client.msclElos.set(args[0], elo + args[1]);
	message.channel.send(`Successfully adjust ${args[0]}'s elo from ${elo} to ${client.msclElos.get(args[0])}`);
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Add to or subtract from a player's elo.")
    .addField("Usage:", "`!elo <IGN> <±amount of elo>`")
    .setColor("DARK_AQUA")
    .setFooter("!flip")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}