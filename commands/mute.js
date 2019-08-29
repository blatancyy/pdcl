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

    let target = await message.guild.fetchMember(user).catch((e) => console.log("Failed to find member when muting."));
    if (!target) return message.channel.send("Successfully found user, but failed to fetch the guildMember.");

    let time = args[1] && args[1].toLowerCase() != 'perm' ? args[1] : "0";
    let reason = args.slice(time == "0" ? 1 : 2).join(" ").replace("--g", "");
    if (!reason) reason = "None provided";
    let global = message.content.endsWith("--g") ? true : false;

    let role = message.guild.roles.find((r) => r.name.toLowerCase() == "muted");
    if (!role) return console.log(`[PDCL v3] Could not find 'Muted' role in ${message.guild.name}.`);
    if (target.roles.has(role.id)) return message.channel.send("This member is already muted. If you wish to mute them globally, unmute them and suffix the mute with '--g'.");

    target.addRole(role).catch(console.error);

    if (global) {
        const leagues = client.config.homeGuilds;
        leagues.forEach(async(league) => {
            let guild = await client.guilds.get(league);
            if (!guild) return console.log(`PDCL v3] Something went wrong whilst fetching guild w/ id ${league}.`);

            // Using guild#fetchMember in case they aren't cached in guild#members, it takes a UserResolvable arg.
            let user = target.user;
            let member = await guild.fetchMember(user).catch((e) => console.log("Member is not in all guilds."));
            if (!member) return;

            let role = guild.roles.find((r) => r.name.toLowerCase() == "muted");    
            if (!role) return console.log(`Did not find a role in ${member.guild.name}.`);
            
            if (member.roles.has(role.id)) return;
            member.addRole(role).catch(console.error);
        });
    }

    global ? message.channel.send("✅ (Global)") : message.channel.send("✅");
console.log(time)
    // Query mute info to db:
	let expiry = client.time(time);
	if (time == 0) time = "Permanent";

    // Ignore permanent mutes.
    if (expiry !== 0) {
        expiry += Date.now();
        const query = `INSERT INTO mute_data (discord, league, expiry, global) VALUES ("${target.user.id}", "${message.guild.id}", "${expiry}", ${global ? 1 : 0});`;
        const db = client.databases.get("discord");
		db.execute(query).catch(e => console.log(`[PDCL v3] Error whilst querying mute information: \n${e}`));
    }
 
    // Logging and DM's:
    const logEmbed = new client.djs.RichEmbed()
    .setAuthor(message.author.tag, message.author.displayAvatarURL)
    .setDescription("A member has been muted.")
    .addField("Target:", target.user.tag, true)
    .addField("Reason:", reason, true)
    .addField("Time:", time, true)
    .setColor("ORANGE")
    .setTimestamp();

    const dmEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .setDescription(`You have been **muted** in **${message.guild.name}**.`)
    .addField("Reason:", reason, true)
    .addField("Time:", time, true)
    .addField("Global ?", global ? "True" : "False", true)
    .setColor("ORANGE")
    .setTimestamp();

    let mutelog = global ? client.channels.get("548965999961964555") : message.guild.channels.find((c) => c.name == "mutelog");
    mutelog.send({embed: logEmbed});
    target.user.send({embed: dmEmbed}).catch(console.error);
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Mute a user for a specified amount of time. Staff only.")
    .addField("Usage:", "`!mute <id> (<time> <reason>)`", true)
    .addField("Example", "`!mute 207896400539680778 6h Racial Slurs.`", true)
    .setColor("DARK_AQUA")
    .setFooter("!mute")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}