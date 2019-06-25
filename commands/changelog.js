exports.run = (client, message, args) => {
    if (message.hub) return;
    message.channel.send("This is a new build of the PDCL Bot, released 02:45 BST 31/05. Our discord bot is now open source and you can view the official repository here: <https://github.com/blatancyy/pdcl>. A changelog is included!");
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Gives info for the bot changelog & repository.")
    .addField("Usage:", "`!changelog`")
    .setColor("DARK_AQUA")
    .setFooter("!changelog")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}