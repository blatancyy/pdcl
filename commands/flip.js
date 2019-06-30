exports.aliases = ['coin', 'coinflip'];
exports.run = (client, message, args) => {
    if (message.hub) return;
    let random = Math.random();
    message.channel.send(`Randomised coin flip returned: ${random > 0.5 ? "**Heads!**" : "**Tails!**"}`);
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Flip a coin! Returns heads/tails.")
    .addField("Usage:", "`!flip`")
    .setColor("DARK_AQUA")
    .setFooter("!flip")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}