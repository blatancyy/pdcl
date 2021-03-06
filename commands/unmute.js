exports.run = async(client, message, args) => {
    if (!message.home) return;
	
	// Input validation: !unmute id 2h reason
	if (!args.length > 0) return message.channel.send("Please provide a discord id.");
	
    // Check permissions using role names, too lazy to use id:
	const muteRoles = ["developer", "management", "director", "global", "leadership"];

    var hasPerms = false;
    muteRoles.forEach((name) => {
        let role = message.guild.roles.find((r) => r.name.toLowerCase() == name);
        if (role !== null && message.member.roles.has(role.id)) hasPerms = true;
	});
    
    let user = await client.fetchUser(args[0]).catch((e) => console.log("Someone provided an invalid id in moderation."));
    if (!user) return message.channel.send(`Did not find a user with the id: ${args[0]}.`);

    let target = await message.guild.fetchMember(user).catch((e) => console.log("Failed to find member when unmuting."));
	if (!target) return message.channel.send("Successfully found user, but failed to fetch the guildMember.");
	
	let role = message.guild.roles.find((r) => r.name.toLowerCase() == "muted");
    if (!role) return console.log(`[PDCL v3] Could not find 'Muted' role in ${message.guild.name}.`);
    if (!target.roles.has(role.id)) return message.channel.send("This member is not muted.");

	const db = client.databases.get('discord');
	const [rows, fields] = await db.execute(`SELECT * FROM mute_data WHERE league_id = "${message.guild.id}" AND target_id = "${args[0]}" AND has_expired = 0;`);
	if (rows.length == 0) {
		target.removeRole(role).catch(console.error);
		return message.channel.send(`Couldn't find any record for their mute. (Removing Mute role)`); // check for role and remove
	}
	if (!hasPerms && rows[0].staff_id != message.author.id) return;

    let time = args[1] ? client.time(args[1]) : "0";
    let reason = args[2] ? args[2].replace("--g", "") : "None Provided.";
    let global = message.content.endsWith("--g") ? true : false;

    target.removeRole(role).catch(console.error);

    if (global) {
        const leagues = client.config.homeGuilds;
        leagues.forEach(async(league) => {
            let guild = client.guilds.get(league);
            if (!guild) return console.log(`Something went wrong whilst fetching guild w/ id ${league}.`);

            let role = guild.roles.find((r) => r.name.toLowerCase() == "muted");
            if (!role) return message.channel.send(`Issue with finding the muted role globally. Guild: ${guild.name}.`);

            // Using guild#fetchMember in case they aren't cached in guild#members, it takes a UserResolvable arg.
            let user = target.user;
            let member = await guild.fetchMember(user).catch((e) => console.log(`[PDCL v3][Global Mutes] Member not in guild ${guild.name}.`));

            if (!member) return;
            if (!member.roles.has(role.id)) return;

            member.removeRole(role).catch(console.error);
        });
	}
	await db.execute(`UPDATE mute_data SET has_expired = 1 WHERE target_id = "${target.id}" AND has_expired = 0 AND league_id = "${message.guild.id}" AND staff_id = "${message.author.id}";`)

    global ? message.channel.send("✅ (Global)") : message.channel.send("✅");

    // Logging and DM's:
    const logEmbed = new client.djs.RichEmbed()
    .setAuthor(message.author.tag, message.author.displayAvatarURL)
    .setDescription("A member has been unmuted.")
    .addField("Target:", target.user.tag, true)
    .addField("Reason:", reason ? reason : 'No reason provided.', true)
    .setColor("GREEN")
    .setFooter("PDCL Bot v2.0")
    .setTimestamp();

    const dmEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .setDescription(`You have been **unmuted** in **${message.guild.name}**.`)
    .addField("Reason:", reason ? reason : 'No reason provided.', true)
    .addField("Global ?", global ? "True" : "False", true)
    .setColor("GREEN")
    .setFooter("PDCL Bot v2.0")
    .setTimestamp();

    let mutelog = global ? client.channels.get("548965999961964555") : message.guild.channels.find((c) => c.name == "mutelog");
    mutelog.send({embed: logEmbed});
    target.user.send({embed: dmEmbed}).catch(console.error);
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Unmute a user. Staff only.")
    .addField("Usage:", "`!unmute <id> (<time> <reason>)`", true)
    .addField("Example", "`!unmute 207896400539680778 False mute.`", true)
    .setColor("DARK_AQUA")
    .setFooter("!unmute")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}