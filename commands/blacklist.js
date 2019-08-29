exports.aliases = ['bl'];
exports.run = async (client, message, args) => {
    if (message.hub) return;
    if (!message.home) return;

    const banRoles = ["referee", "management", "director", "global", "leadership"];
    var hasPerms = false;
    banRoles.forEach((name) => {
        let role = message.guild.roles.find((r) => r.name.toLowerCase() == name);
        if (role !== null && message.member.roles.has(role.id)) hasPerms = true;
    });

    if (!hasPerms) return;

    // Input validation: !ban @user 2h reason
    let target = message.mentions.members.first(); 
    if (!target) {
        let user = client.users.get(args[0]);
        if (!user) return message.channel.send("Did not find a mention or a valid discord id.");

        target = await message.guild.fetchMember(user);
        if (!target) return message.channel.send("Provided a valid discord id but still could not fetch member. If you think this is an issue, tag fred.");
    }

    let time = args[1];
	if (!time) return message.channel.send("Please provide a valid time.");
	if (time == 0 || time.toLowerCase() == 'perm') time = "Permanent"

    if (args.length < 3) return message.channel.send("Please provide a reason.");
    let reason = args.slice(2).join(" ").replace("--g", "");
	if (!reason) return message.channel.send("Please provide a reason.");
	let global = message.content.endsWith("--g") ? true : false;

    const blacklistEmbed = new client.djs.RichEmbed()
      .setAuthor(client.user.tag, client.user.displayAvatarURL)
      .setDescription(`You have been blacklisted in **${global ? 'all leagues' : message.guild.name}**.`)
      .addField("Time", time, true)
      .addField("Reason", reason, true)
      .setColor('RED')
      .setTimestamp();

    let smessage = await message.channel.send("RichEmbed which has been sent: ");
    message.channel.send({embed: blacklistEmbed});
    target.user.send({embed: blacklistEmbed}).catch((e) => message.channel.send("Could not send the embed to the user. Bot blocked?"));
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Sends the user a message about a blacklist anonymously. Referee+ Only.")
    .addField("Usage:", "`!blacklist @user <time> <reason> [--g]`", true)
    .addField("Example:", "`!blacklist @fred 60d Paid Cheats.`", true)
    .setColor("DARK_AQUA")
    .setFooter("!blacklist")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}