exports.aliases = ['m']
exports.run = async (client, message, args) => {
    if (!message.home) return;
    
    // Check permissions using role names:
    const muteRoles = ["developer", "referee", "management", "director", "global", "leadership", "trial referee", "chat moderator"];

    var hasPerms = false;
    muteRoles.forEach((name) => {
        let role = message.guild.roles.find((r) => r.name.toLowerCase() == name);
        if (role !== null && message.member.roles.has(role.id)) hasPerms = true;
    });

    if (!hasPerms) return;

    // Input validation: !mute id 2h reason
    if (!args.length > 0) return message.channel.send("Please provide a discord id.");
    let user = await client.fetchUser(args[0]).catch((e) => console.log("Someone provided an invalid id in moderation."));
    if (!user) return message.channel.send(`Did not find a user with the id: ${args[0]}.`);

	const db = client.databases.get('discord');
	const logs = db.execute(`SELECT * FROM mute_data WHERE league_id = "${message.guild.id}" AND target_id = "${args[0]}";`);

    // Logging and DM's:
    const logEmbed = new client.djs.RichEmbed()
		.setAuthor(message.author.tag, message.author.displayAvatarURL)
		.setDescription(target.user.tag)
		.addField("Current Mutes", `In no particular order: ${logs.filter(log => log.expiry > Date.now()).map(log => `${client.fetchUser(log.staff_id)}/${log.staff_id} - ${log.reason} - ${client.time(log.expiry)}`).join('\n')}`, true)
		.addField("Previous Mutes", `In no particular order: ${logs.filter(log => log.expiry < Date.now()).map(log => `${client.fetchUser(log.staff_id)}/${log.staff_id} - ${log.reason} - ${client.time(log.expiry)}`).join('\n')}`, true)
		.setColor("ORANGE")
		.setTimestamp();
	message.channel.embed(logEmbed);
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Reveal a user's punihsment history. Staff only.")
    .addField("Usage:", "`!modlog <id>`", true)
    .addField("Example", "`!modlog 207896400539680778.`", true)
    .setColor("DARK_AQUA")
    .setFooter("!modlog")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}