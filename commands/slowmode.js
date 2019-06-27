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
        let newCount = args[0];
        await message.channel.setRateLimitPerUser(newCount).catch((e) => {
            if (e) return message.channel.send(`Provide a time in seconds.`);
        });

        message.channel.send(`✅ Successfully set the channel slowmode to: ${newCount} seconds.`);   
    } else {
        await message.channel.setRateLimitPerUser(0);
        message.channel.send("✅ Reset slowmode.");
    }
}