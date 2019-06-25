module.exports = (client, message) => {
    if (message.author.bot) return;
    let homeGuild = client.config.homeGuilds.includes(message.guild.id);
    if (!homeGuild) return;

    const disabledChannels = ["news_management", "news_refs", "news_hosts", "news_media", "news_advisory", "advisory", "media", "hosts", "refs", "managers", "ss-list", "blacklist-log"];
    if (disabledChannels.includes(message.channel.name)) return;

    const channel = message.guild.channels.find((c) => c.name.toLowerCase() == "modlog");
    if (!channel) return console.log(`[PDCL v3] Could not find 'modlog' channel in ${message.guild.name}.`);
    let image = message.attachments.first();

    const logEmbed = new client.djs.RichEmbed()
    .setAuthor(message.author.tag, message.author.avatarURL)
    .addField("Content", message.content)
    .addField("Channel", message.channel)
    .setColor("RED")
    .setFooter("Message Delete")
    .setTimestamp();

    if (image) logEmbed.setImage(image.url);

    channel.send({embed: logEmbed});
} 