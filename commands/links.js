exports.run = (client, message, args) => { 
    const league = client.guildData.get(message.guild.id);
    const links = `🔹 [Discord](https://pdcr.sh/${league})\n🔹 [Rules](https://${league}.mpcleague.com/rules)\n🔹 [Staff](
    https://${league}.mpcleague.com/staff)\n🔹 [Rankings](https://${league}.mpcleague.com/team)\n🔹 [Blacklist](
        https://${league}.mpcleague.com/blacklist)\n\n🔹 [Podcrash+](https://plus.podcrash.co)`;

    const linksEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .setDescription(links)
    .setColor("CYAN")
    .setFooter("PDCL Bot v2")
    .setTimestamp();

    message.author.send({embed: linksEmbed}).catch(console.error);
    message.react("✅").catch(console.error);
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Provides important links for the configured league via pm.")
    .addField("Usage:", "`!links`")
    .setColor("DARK_AQUA")
    .setFooter("!links")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}