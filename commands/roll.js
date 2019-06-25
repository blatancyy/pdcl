// By LifeStrike™

exports.run = (client, message, args) => {
    if (message.hub) return;
    
    let roll = Math.floor(Math.random() * 6) + 1;
    message.channel.send(`You rolled a ${roll}!`);
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Roll a dice! Returns a random number between 1-6.")
    .addField("Usage:", "`!roll`")
    .setColor("DARK_AQUA")
    .setFooter("!roll")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}

