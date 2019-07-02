exports.aliases = ["rban"];
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

    let role = message.guild.roles.find((r) => r.name.toLowerCase() == league.config.ranked.banRole);
    if (!role) return message.channel.send(`Did not find 'Ranked Banned' role in this guild. - Config includes ${client.config.ranked.banRole}.`);

    // The weird caching has bugged in the past so: (Takes UserResolvable arg).
    let member = message.member;
    if (!member) member = await message.guild.fetchMember(message.author);

    if (member.roles.has(role.id)) {
        member.removeRole(role).catch(console.error);
        message.channel.send("✅ (Remove)");
    } else {
      message.member.addRole(role).catch(console.error);
      message.channel.send("✅ (Add)");
    }
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Ban the user from ranked, using the Ranked Banned role.")
    .addField("Usage:", "`!rankedban <id>`", true)
    .addField("Example", "`!rankedban 207896400539680778`", true)
    .setColor("DARK_AQUA")
    .setFooter("!rankedban")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}