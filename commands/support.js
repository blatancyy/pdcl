exports.run = async(client, message, args) => {
    if (message.hub) return;
    if (message.guild.id !== "542848649202499584") return;

    // Check to see if they have a ticket open
    let foundChannel = message.guild.channels.find((c) => c.name === message.author.id);
    if (foundChannel) return message.channel.send("You already have a ticket open.");

    // Check to see if they have "recently" opened a channel - to avoid spam. The "timeout" ends when the channel is deleted by CM.
    let recentChannel = message.guild.channels.find((c) => c.name === `closed-${message.author.id}`);
    if (recentChannel) message.channel.send("You have opened a ticket recently. To avoid abuse, you will not be able to open a new channel until the former is closed. If you need further assistance, contact a member of support.");

    // Create the new channel:
    let createdChannel = await message.guild.createChannel(message.author.id, "text", [{
        id: message.guild.id,
        deny: ["READ_MESSAGES"],
      }, {
        id: message.author.id,
        allow: ["READ_MESSAGES"],
      }, {
        id: "543667614212161557",
        allow: ["READ_MESSAGES"]
      }]);
      
      // Set the channel parent to the support category.
      createdChannel.setParent("543839826672353287");
      
      // Send the message in the new channel. @Vilare #CopyPasta
      let supportRole = message.guild.roles.get("543667614212161557");
      createdChannel.send(`${message.author}, Thank you for contacting our ${supportRole} branch!  Here at the PDCL community satisfaction is our main goal, and we are happy to help you optimize your experience with us!  If you wouldn't mind describing the problem or area of which you need help at to us it'd be much appreciated.  Once completed, one of our support agents will be with you shortly but please be patient!  Your report could be answered within the hour or a few hours from now depending on the time you create it, but regardless it will be answered in the professional fashion you deserve. If you wish to close your ticket, a member of staff will do so - however respect that there is a cooldown on ticket creations.`);
      
      message.react("✅");
}

exports.help = (client, message, args) => {
  if (message.hub) return;

  const helpEmbed = new client.djs.RichEmbed()
  .setAuthor(client.user.tag, client.user.displayAvatarURL)
  .addField("Description:", "Create a support ticket. Only available in the Community discord.")
  .addField("Usage:", "`!support`")
  .setColor("DARK_AQUA")
  .setFooter("!support")
  .setTimestamp();

  message.channel.send({embed: helpEmbed});
}