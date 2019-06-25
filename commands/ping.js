exports.run = (client, message, args) => {
    if (message.hub) return;
    return message.channel.send("Pong!");
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Returns 'Pong!'")
    .addField("Usage:", "`!ping`")
    .setColor("DARK_AQUA")
    .setFooter("!ping")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}