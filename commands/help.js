exports.aliases = ['h']
exports.run = async (client, message, args) => {
    let commands = [];    
    for (const command of client.commands.keys()) {
        commands.push(command);   
    }

    commands = commands.map((command) => `\`${command}\``).join(", ");
    let helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .setDescription(`Use \`?command\` to view help for each individual command. If you require further assistance with the bot, contact fred#5775. If you need support associated with the PDCL, you may use the !support command in [the community discord](https://discord.gg/WUczZuF).`)
    .addField("Supported Commands:", commands)
    .setColor("LUMINOUS_VIVID_PINK")
    .setFooter("!help")
    .setTimestamp();

    message.author.send({embed: helpEmbed}).catch((e) => console.error("User has bot blocked? Failed to send pm."));
    message.react("✅").catch((e) => {});
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Gives help to the user.")
    .addField("Usage:", "`!help`")
    .addField("Example", "`!help`")
    .setColor("DARK_AQUA")
    .setFooter("!help")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}