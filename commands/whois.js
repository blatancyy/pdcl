exports.aliases = ['who', 'profile'];
exports.run = async (client, message, args) => {
    if (message.hub) return;

    // https://discord.js.org/#/docs/main/stable/typedef/ColorResolvable
    const presenceColours = new Map().set("online", "GREEN").set("idle", "ORANGE").set("dnd", "RED").set("offline", "GREY");

    const whoisRoles = ["developer", "referee", "management", "director", "global", "leadership", "trial referee", "chat moderator", "host"];
    var hasPerms = false;
    whoisRoles.forEach((name) => {
        let role = message.guild.roles.find((r) => r.name.toLowerCase() == name);
        if (role !== null && message.member.roles.has(role.id)) hasPerms = true;
    });

    if (!hasPerms) return;
    
    var member;
    var user;
    if (args.length > 0) {        
        user = await client.fetchUser(args[0]).catch((e) => console.log(e));
        if (!user) return message.channel.send(`Couldn't find a user with the id: ${args[0]}.`);

        member = await message.guild.fetchMember(user);
        if (!member) return message.channel.send("Successfully found a user, but failed in fetching the guildMember.");
    } else {
        member = message.member;
        user = member.user;
    }

    let joinedDate = member.joinedAt;
    let createdDate = user.createdAt;

    let roles = member.roles.array();
    let everyone = roles.find((r) => r.id == message.guild.id);
    roles.splice(roles.indexOf(everyone), 1);
    
    roles.length > 0 ? roles.map((r) => r).join(", ") : roles = "None";

    let colour = presenceColours.get(user.presence.status);
    let lmessage = member.lastMessage;
    let cached = lmessage ? true : false;
    
    const whoisEmbed = new client.djs.RichEmbed()
    .setAuthor(user.tag, user.displayAvatarURL)
    .addField("Created", formatDate(createdDate), true)
    .addField("Joined", formatDate(joinedDate), true)
    .addField("Roles", roles)
    .addField("Last Message", `Content: ${cached ? lmessage.content : "Message not cached."}`) 
    .setColor(colour)
    .setFooter(`ID: ${user.id}`)
    .setTimestamp();
    
    message.channel.send({embed: whoisEmbed});
}

function formatDate(d) {
  let year = d.getFullYear();
  let month = addLeadingZero(d.getMonth());
  let day = addLeadingZero(d.getDay());
  return year + '-' + month + '-' + day;
}

function addLeadingZero(n) {
    return n < 10 ? '0' + n : '' + n;
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Show information about a discord account.")
    .addField("Usage:", "`!whois (<id>)`", true)
    .addField("Example", "`!whois 207896400539680778`", true)
    .setColor("DARK_AQUA")
    .setFooter("!whois")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}