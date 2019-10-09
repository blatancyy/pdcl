exports.aliases = ["insertms"];
exports.run = async (client, message, args) => {	
    if (!message.home) return;
    if (message.hub) return;
    if (!args.length > 0) return message.channel.send("Please provide the exported stats.");

    let league = client.config.leagues.find((l) => l.config.id == message.guild.id);
    if (league.config.name !== "mscl") return;

    let role = message.guild.roles.find((r) => r.name.toLowerCase() == "management");
    if (!league.config.ranked.stats.includes(message.author.id) && !message.member.roles.has(role.id)) return;

	let allPlayers = await client.processStats(client, message.content);
    let mappedPlayers = allPlayers.map((p) => `IGN: ${p.ign} | Rounds Played : ${p.rounds} | Carry ? ${p.carry} | K: ${p.kills} | D: ${p.deaths} | W ? ${p.win} | L ? ${p.loss} | Tied ? ${p.tie} | Elo: ${p.elo} | + Elo: ${p.calculatedElo}.\n`);

    message.channel.send(`\`\`\`\n${mappedPlayers.join("\n")}\n\nby ${message.author.tag}\n\`\`\``);
    message.channel.send("Is the above information correct? Reply yes/no. If 'no', let @ Snowful#1513 know ASAP.\nP.S. *Actually review the above please* kthxguys");

	let confirmation = await message.channel.awaitMessages((msg) => msg.author.id == message.author.id, { max: 1, time: 120000, errors: ['time'] })
		.catch(() => message.channel.send('Aborting stats insert. --> Time Ran Out!'));
	
    if (!confirmation) return;
    if (confirmation.first().content.toLowerCase() != 'yes') return message.channel.send('Aborting stats insert. --> User Cancelled!');

    // Update into db for each player :D. We will want to catch and SEND TO CHANNEL if can't find an ign.
    let db = client.databases.get(message.league);
    let table = league.config.ranked.table;

    allPlayers.forEach(async(p) => {
        let playerElo = client.playerElos.get(p.ign);
        if (!playerElo.mscl && playerElo.mscl !== 0) return message.channel.send(`The player '${p.ign}' doesn't seem to be in our database. Their stats have not been updated and their elo was assumed as 0.`);

		playerElo.mscl = playerElo.mscl + p.calculatedElo;
        client.playerElos.set(p.ign, playerElo);
        await db.execute(`UPDATE ${table} SET kills = kills + ${p.kills}, deaths = deaths + ${p.deaths}, wins = wins + ${p.win}, losses = losses + ${p.loss}, draws = draws + ${p.tie}, games_played = games_played + 1, games_carried = games_carried + ${p.carry}, elo = elo + ${p.calculatedElo} WHERE displayname = "${p.ign}";`).catch(console.error);
        console.log(`Successfully updated stats for ${p.ign}.`);
    });

    message.channel.send("✅");
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Insert ranked stats for a game. **Note:** you should copy/paste **all** of the export content (not just the names and stats) purely as it is exported. Make sure each player & their stats are on their own line (see example).")
    .addField("Usage:", "`!insertms <export content>`")
    .addField("Example:", "`!insertms MineStrike - Inferno\nSWAT 9\nname1 18-12 +6 0.0% 1.43\nname2 19-11 +8 5.3% 1.40\nname3 16-13 +3 12.5% 1.12\n" +
	"name4 8-12 -4 12.5% 0.69\nname5 8-15 -7 12.5% 0.62\nBombers 9\nname6 20-13 +7 0.0% 1.51\nname7 15-15 +0 6.7% 1.17\nname8 14-13 +1 14.3% 1.03\n" +
	"name9 10-13 -3 10.0% 0.83\nname10 4-15 -11 0.0% 0.35`")
    .setColor("DARK_AQUA")
    .setFooter("!insertms")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}