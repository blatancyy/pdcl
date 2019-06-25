exports.run = (client, message, args) => {
    if (message.hub) return;
    
    const inviteEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .setDescription("You can add the PDCL Bot to your guild [here.](https://bit.ly/2WIu6tp)")
    .addField("Info", "Use the !setleague or !help commands for more details.")
    .setColor("LUMINOUS_VIVID_PINK")
    .setTimestamp();

    message.channel.send({embed: inviteEmbed});
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Provides an invite link for the bot.")
    .addField("Usage:", "`!invite`")
    .setColor("DARK_AQUA")
    .setFooter("!invite")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}
