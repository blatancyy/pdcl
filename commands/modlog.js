
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
	const [logs, fields] = await db.execute(`SELECT * FROM mute_data WHERE target_id = "${args[0]}";`);

    // Logging and DM's:
	const logEmbed = new client.djs.RichEmbed()
		.setAuthor(user.tag, user.displayAvatarURL)
		.addField("Current Mutes", `In no particular order:\n${logs.filter(log => log.has_expired == 0)
			.map(log => `${log.global == 1 ? 'Global' : 'Local'} Mute in ${client.guilds.get(log.league_id).name}:\n${log.staff_id == '' ? 'Staff member unspecified.' : `${client.users.find(u => u.id == log.staff_id).tag}/${log.staff_id}`}\nReason: ${log.reason}\nExpires in: ${client.time(parseInt(log.expiry)-Date.now())}`).join('\n**---**\n')}`.slice(0, 1024), true)
		.addField("Previous Mutes", `In no particular order:\n${logs.filter(log => log.has_expired == 1)
			.map(log => `${log.global == 1 ? 'Global' : 'Local'} Mute in ${client.guilds.get(log.league_id).name}:\n${log.staff_id == '' ? 'Staff member unspecified.' : `${client.users.find(u => u.id == log.staff_id).tag}/${log.staff_id}`}\nReason: ${log.reason}\n${Date.now()-parseInt(log.expiry) >= 0 ? `Expired: ${client.time(Date.now()-parseInt(log.expiry))} ago` : `Original expiration in: ${client.time(parseInt(log.expiry)-Date.now())}`}`).join('\n**---**\n')}`.slice(0, 1024), true)
		.setColor("ORANGE")
		.setTimestamp();
	message.channel.send({embed: logEmbed});
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