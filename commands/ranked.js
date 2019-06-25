exports.run = async(client, message, args) => {
    if (message.hub) return;
    if (!message.home) return;

    const league = client.config.leagues.find((l) => l.config.id == message.guild.id);
    if (!league.config.ranked.status) return;

    let role = message.guild.roles.find((r) => r.name.toLowerCase() == league.config.ranked.role);
    if (!role) return message.channel.send(`Did not find 'Ranked' role in this guild. - Config includes ${client.config.ranked.role}.`);

    // The weird caching has bugged in the past so: (Takes UserResolvable arg).
    let member = message.member;
    if (!member) member = await message.guild.fetchMember(message.author);

    if (member.roles.has(role.id)) {
        member.removeRole(role).catch(console.error);
        message.channel.send("✅ (Remove)");
    } else {
      message.member.addRole(role).catch(console.error);
      message.channel.send("✅ (Add)");
    }
}

exports.help = (client, message, args) => {
  if (message.hub) return;

  const helpEmbed = new client.djs.RichEmbed()
  .setAuthor(client.user.tag, client.user.displayAvatarURL)
  .addField("Description:", "Toggle the 'Ranked' command, if applicable.")
  .addField("Usage:", "`!ranked`")
  .setColor("DARK_AQUA")
  .setFooter("!ranked")
  .setTimestamp();

  message.channel.send({embed: helpEmbed});
}