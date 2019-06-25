module.exports = (client, oldm, newm) => {
    if (oldm.author.bot) return;
    let homeGuild = client.config.homeGuilds.includes(oldm.guild.id);
    if (!homeGuild) return;

    const disabledChannels = ["news_management", "news_refs", "news_hosts", "news_media", "news_advisory", "advisory", "media", "hosts", "refs", "managers", "ss-list", "blacklist-log"];
    if (disabledChannels.includes(oldm.channel.name)) return;

    const channel = oldm.guild.channels.find((c) => c.name.toLowerCase() == "modlog");
    if (!channel) return console.log(`[PDCL v3] Could not find channel 'modlog' in ${message.guild.name}`);

    const message = `**Old Message:** ${oldm.content}\n**New Message:** ${newm.content}`;
    const logEmbed = new client.djs.RichEmbed()
    .setAuthor(oldm.author.tag, oldm.author.displayAvatarURL)
    .addField("Edit:", message.length > 2048 ? `${message.slice(0, 2040)}...` : message)
    .addField("Channel:", oldm.channel, true)
    .addField("Original:", `[Jump!](https://discordapp.com/channels/${oldm.guild.id}/${oldm.channel.id}/${oldm.id})`, true)
    .setColor("ORANGE")
    .setFooter("Message Edit")
    .setTimestamp();

    channel.send({embed: logEmbed});
}