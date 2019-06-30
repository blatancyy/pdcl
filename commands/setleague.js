exports.aliases = ['configure', 'setup'];
exports.run = async (client, message, args) => {
    let validLeagues = ["ccl", "bcl", "mscl", "swcl", "cwcl"];

    if (!message.member.hasPermission("ADMINISTRATOR") && message.author.id !== "207896400539680778") return message.channel.send("You need to be an administrator to do this!");
    if (!args.length) return message.channel.send(`Please use a valid league! : ${validLeagues.join(", ")}`);

    let entry = client.guildData.get(message.guild.id);
    let league = args[0].toLowerCase();
    let db = client.databases.get("discord");

    if (!validLeagues.includes(league)) return message.channel.send(`Please use a valid league! : ${validLeagues.join(", ")}`);

    if (entry) {
        console.log(`[PDCL v3] Changing guild: ${message.guild.name} to league: ${league}.`);
        await db.query(`UPDATE guild_data SET league = '${league}' WHERE guild = '${message.guild.id}'`);
        await client.loadGuildData();
    } else {
        console.log(`[PDCL v3] Creating new row for league: ${message.guild.name} to ${league}.`); 
        await db.query(`INSERT INTO guild_data (guild, league) VALUES ('${message.guild.id}', '${league}');`);
        await client.loadGuildData();      
    }

    // await client.guildData.set(message.guild.id, league).catch((e) => console.log(`Error whilst setting keyv data: ${e}`));
    message.channel.send("✅");
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Configure the league for the guild. Server Admin+.")
    .addField("Usage:", "`!setleague <league>`", true)
    .addField("Example", "`!setleague ccl`", true)
    .setColor("DARK_AQUA")
    .setFooter("!setleague")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}