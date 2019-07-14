exports.run = async(client, message, args) => {
    if (!message.home) return;
    if (message.hub) return;

    if (!args.length > 0) return message.channel.send("Please provide a UUID.");
    let username = await client.fetchUsername(args[0]);
    if (!username) return message.channel.send("Failed to fetch your username.");

    message.channel.send(`Successfully found player: ${username}! Starting Elo: To be done later when we have the db setup after ranked ends.`);
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Signup for a ranked season.")
    .addField("Usage:", "`!signup <uuid>`", true)
    .addField("Example", "`!signup c0dca1da-7a15-4d12-8006-603640a72846`", true)
    .setColor("DARK_AQUA")
    .setFooter("!signup")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}