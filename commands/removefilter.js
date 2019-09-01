exports.aliases = ['m']
exports.run = async (client, message, args) => {

    const allowedRoles = ["developer", "referee", "management", "director", "global", "leadership", "trial referee", "chat moderator"];

    var hasPerms = false;
    allowedRoles.forEach((name) => {
        let role = message.guild.roles.find((r) => r.name.toLowerCase() == name);
        if (role !== null && message.member.roles.has(role.id)) hasPerms = true;
	});
	if (!hasPerms) return;
	let oldWord = args[0].toLowerCase();
	if (!client.filteredWords.includes(oldWord)) return message.channel.send('That word isn\'t being filtered');

	const query = `DELETE FROM bad_words WHERE word = "${oldWord}";`;
	const db = client.databases.get("discord");
	await db.execute(query).catch(e => console.log(`[PDCL v3] Error whilst querying mute information: \n${e}`));
	client.loadGuildData();

	message.channel.send('Successfully added new word to filter.');
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Remove a word filtered out in chat. Staff only.")
    .addField("Usage:", "`!removefilter <word>`", true)
    .addField("Example", "`!removefilter heck.`", true)
    .setColor("DARK_AQUA")
    .setFooter("!removefilter")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}