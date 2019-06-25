module.exports = (client, oldm, newm) => {
    if (!client.config.homeGuilds.includes(oldm.guild.id)) return;
    const league = client.config.leagues.find((l) => l.config.id == oldm.guild.id);
    if (!league.config.ranked.status) return;

    const category = oldm.guild.channels.find((c) => c.type == "category" && c.name.toLowerCase() == league.config.ranked.category);
    if (!category) return;        
 
    if (oldm.voiceChannel && oldm.voiceChannel.parentID !== category.id) return;
    if (newm.voiceChannel && newm.voiceChannel.parentID !== category.id) return;

    const channel = oldm.guild.channels.find((c) => c.name == "call-log");
    if (!channel) return;

    if (!oldm.voiceChannel && newm.voiceChannel) {
        const userJoin = new client.djs.RichEmbed()
        .setAuthor(oldm.user.tag, oldm.user.displayAvatarURL)
        .setDescription(`User has joined voice channel \`${newm.voiceChannel.name}\`.`)
        .setFooter(`ID: ${oldm.user.id}`)
        .setColor("GREEN")
        .setTimestamp();

        channel.send({embed: userJoin});
    }

    if (oldm.voiceChannel && !newm.voiceChannel) {
        const userLeave = new client.djs.RichEmbed()
        .setAuthor(oldm.user.tag, oldm.user.displayAvatarURL)
        .setDescription(`User has left voice channel \`${oldm.voiceChannel.name}\`.`)
        .setFooter(`ID: ${oldm.user.id}`)
        .setColor("RED")
        .setTimestamp();

        channel.send({embed: userLeave});
    }

    if ((oldm.voiceChannel && newm.voiceChannel) && (oldm.voiceChannel.id !== newm.voiceChannel.id)) {
        const userChange = new client.djs.RichEmbed()
        .setAuthor(oldm.user.tag, oldm.user.displayAvatarURL)
        .setDescription(`User has changed voice channel: \`${oldm.voiceChannel.name}\` --> \`${newm.voiceChannel.name}\`.`)
        .setFooter(`ID: ${oldm.user.id}`)
        .setColor("ORANGE")
        .setTimestamp();

        channel.send({embed: userChange});
    }        
};