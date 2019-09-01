exports.run = async (client, message, args) => {

    const allowedRoles = ["developer", "referee", "management", "director"];

    var hasPerms = false;
    allowedRoles.forEach((name) => {
        let role = message.guild.roles.find((r) => r.name.toLowerCase() == name);
        if (role !== null && message.member.roles.has(role.id)) hasPerms = true;
	});
	if (!hasPerms) return;
	let newWord = args[0].toLowerCase();
	if (client.filteredWords.includes(newWord)) return message.channel.send('That word is already being filtered');

	const query = `INSERT INTO bad_words (word) VALUES ("${newWord}");`;
	const db = client.databases.get("discord");
	await db.execute(query).catch(e => console.log(`[PDCL v3] Error whilst querying mute information: \n${e}`));
	client.loadGuildData();

	message.channel.send('Successfully added new word to filter.');
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Add a word to filter out in chat. Staff only.")
    .addField("Usage:", "`!addfilter <word>`", true)
    .addField("Example", "`!addfilter heck.`", true)
    .setColor("DARK_AQUA")
    .setFooter("!addfilter")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}