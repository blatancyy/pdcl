exports.run = async (client, message, args) => {

    const allowedRoles = ["developer", "referee", "management", "director"];

    var hasPerms = false;
    allowedRoles.forEach((name) => {
        let role = message.guild.roles.find((r) => r.name.toLowerCase() == name);
        if (role !== null && message.member.roles.has(role.id)) hasPerms = true;
	});
	if (!hasPerms) return;

	message.channel.send(client.filteredWords.join('\n'));
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "View filtered words.")
    .addField("Usage:", "`!filteredwords", true)
    .setColor("DARK_AQUA")
    .setFooter("!filteredwords")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}