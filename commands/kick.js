exports.run = async(client, message, args) => {
    if (!message.home) return;
    
    // Check permissions using role names:
    const kickRoles = ["developer", "referee", "management", "director", "global", "leadership", "trial referee", "chat moderator"];
    var hasPerms = false;
    kickRoles.forEach((name) => {
        let role = message.guild.roles.find((r) => r.name.toLowerCase() == name);
        if (role !== null && message.member.roles.has(role.id)) hasPerms = true;
    });

    if (!hasPerms) return;

    // Input validation: !kick id 2h reason
    if (!args.length > 0) return message.channel.send("Please provide a discord id.");
    let user = await client.fetchUser(args[0]).catch((e) => console.log("Someone provided an invalid id in moderation."));
    if (!user) return message.channel.send(`Did not find a user with the id: ${args[0]}.`);

    let target = await message.guild.fetchMember(user).catch((e) => console.log("Failed to find member when kicked."));
    if (!target) return message.channel.send("Successfully found user, but failed to fetch the guildMember.");

    let time = args[1] ? client.time(args[1]) : "0";
    let reason = args.slice(time == "0" ? 1 : 2).join(" ").replace("--g", "");
    if (!reason) reason = "None provided.";
    let global = message.content.endsWith("--g") ? true : false;

    target.kick();
    if (global) {
        const leagues = client.config.homeGuilds;
        leagues.forEach(async(league) => {
            let guild = client.guilds.get(league);
            if (!guild) return console.log(`Something went wrong whilst fetching guild w/ id ${league}.`);

            // Using guild#fetchMember in case they aren't cached in guild#members, it takes a UserResolvable arg.
            let user = target.user;
            let member = await guild.fetchMember(user);
            if (!member) return;

            member.kick().catch(console.error);
        });
    }

    global ? message.channel.send("✅ (Global)") : message.channel.send("✅");

    // Logging and DM's:
    const logEmbed = new client.djs.RichEmbed()
    .setAuthor(message.author.tag, message.author.displayAvatarURL)
    .setDescription("A member has been kicked.")
    .addField("Target:", target.user.tag, true)
    .addField("Reason:", reason, true)
    .addField("Time:", client.time(time), true)
    .setColor("RED")
    .setFooter("Member Kicked")
    .setTimestamp();

    const dmEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .setDescription(`You have been **kicked** in **${message.guild.name}**.`)
    .addField("Reason:", reason, true)
    .addField("Time:", client.time(time), true)
    .addField("Global ?", global ? "True" : "False", true)
    .setColor("RED")
    .setFooter("Member Kicked")
    .setTimestamp();

    let log = global ? client.channels.get("548965999961964555") : message.guild.channels.find((c) => c.name == "mutelog");
    log.send({embed: logEmbed});
    target.user.send({embed: dmEmbed}).catch(console.error);
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Kicks the specified user from the guild. Staff only.")
    .addField("Usage:", "`!kick <id> (<time> <reason>)`", true)
    .addField("Example:", "`!kick 207896400539680778 7d Extreme Toxicity.`", true)
    .setColor("DARK_AQUA")
    .setFooter("!kick")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}