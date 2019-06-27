exports.run = async(client, message, args) => {
    if (!message.home) return;

    // Check permissions using role names:
    const slowmodeRoles = ["developer", "referee", "management", "director", "global", "leadership", "trial referee", "chat moderator"];

    var hasPerms = false;
    slowmodeRoles.forEach((name) => {
        let role = message.guild.roles.find((r) => r.name.toLowerCase() == name);
        if (role !== null && message.member.roles.has(role.id)) hasPerms = true;
    });

    if (!hasPerms) return;

    let count = message.channel.rateLimitPerUser;
    if (count == 0) {
        if (!args.length > 0) return message.channel.send(`Provide a time in seconds.`);
        let newCount = args[0];
        var successful = true;

        await message.channel.setRateLimitPerUser(newCount).catch((e) => {
            if (e)  message.channel.send(`Provide a time in seconds.`);
            successful = false;
        });  

        if (!successful) return;
        message.channel.send(`✅ Successfully set the channel slowmode to: ${newCount} seconds.`); 
    } else {
        await message.channel.setRateLimitPerUser(0);
        message.channel.send("✅ Reset slowmode.");
    }
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Sets/Resets the slowmode of the channel.")
    .addField("Usage:", "`!slowmode (<timeinseconds>)`", true)
    .addField("Example:", "`!slowmode 5`", true)
    .setColor("DARK_AQUA")
    .setFooter("!slowmode")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}