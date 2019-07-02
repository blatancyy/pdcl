exports.aliases = ["ruban"];
exports.run = async(client, message, args) => {
    if (!message.home) return;

    const rankedBanRoles = ["global", "leadership", "ranked ms organizer", "management"];

    var hasPerms = false;
    rankedBanRoles.forEach((name) => {
        let role = message.guild.roles.find((r) => r.name.toLowerCase() == name);
        if (role !== null && message.member.roles.has(role.id)) hasPerms = true;
    });

    if (!hasPerms) return;

    const league = client.config.leagues.find((l) => l.config.id == message.guild.id);
    if (!league.config.ranked.status) return;

    // Input validation: !rban id reason
    if (!args.length > 0) return message.channel.send("Please provide a discord id.");
    let user = await client.fetchUser(args[0]).catch((e) => console.log("Someone provided an invalid id in moderation."));
    if (!user) return message.channel.send(`Did not find a user with the id: ${args[0]}.`);

    let member = await message.guild.fetchMember(user).catch((e) => console.log("Failed to find member when ranked banning."));
    if (!member) return message.channel.send("Successfully found user, but failed to fetch the guildMember.");

    let reason = args.slice(1).join(" ");
    if (!reason) return message.channel.send("provide a reason kthx");

    let role = message.guild.roles.find((r) => r.name.toLowerCase() == league.config.ranked.banRole);
    if (!role) return message.channel.send(`Did not find 'Ranked Banned' role in this guild. - Config includes ${client.config.ranked.banRole}.`);

    let isBanned = member.roles.has(role.id);
    if (!isBanned) return message.channel.send("This member is not banned from ranked.");

    await member.removeRole(role).catch(console.error);
    message.channel.send(`✅ Unbanned ${member.user.tag} from ranked.`);

    // Logging and DM's:
    const logEmbed = new client.djs.RichEmbed()
    .setAuthor(member.user.tag, member.user.displayAvatarURL)
    .setDescription(`A member has been unbanned from ranked.`)
    .addField("Member:", member.user.tag, true)
    .addField(`Unbanned By:`, message.author.tag, true)
    .addField("Reason:", reason)
    .setColor("WHITE")
    .setFooter("Ranked Bans")
    .setTimestamp();

    const dmEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .setDescription(`You have been **unbanned from ranked** in **${message.guild.name}**.`)
    .addField(`Unbanned By:`, message.author.tag)
    .addField("Reason:", reason)
    .setColor("WHITE")
    .setFooter("Ranked Bans")
    .setTimestamp();

    let rankedLog = message.guild.channels.find((c) => c.name.toLowerCase() == "ranked-ban-log");
    rankedLog.send({embed: logEmbed}).catch(console.error);
    member.user.send({embed: dmEmbed}).catch(console.error);
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Unban the user from ranked, using the Ranked Banned role.")
    .addField("Usage:", "`!rankedunban <id> <reason>`", true)
    .addField("Example", "`!rankedunban 207896400539680778 no longer a bot`", true)
    .setColor("DARK_AQUA")
    .setFooter("!rankedunban")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}

    