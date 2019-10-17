exports.run = async (client) => {
	const db = client.databases.get("discord");
	const [rows, fields] = await db.execute("SELECT * FROM ranked_bans").catch((e) => console.log(`[PDCL v3] Error whilst querying for mutes. \n${e}`));

	if (!rows.length) return console.log("[PDCL v3] Did not find any entries for ranked bans.");

	rows.forEach(async(entry) => {
		let expired = entry.expiry > Date.now();
        if (expired == true) return;
        
		let league = client.guilds.get(entry.league);
		if (!league) return console.log(`[PDCL v3] Something went wrong: Failed to find guild in unmute timer.`);

        unban(client, league, entry.discord);
        log(client, league, entry.discord);

        // Remove row.
	    db.execute(`DELETE FROM ranked_bans WHERE id = ${entry.id}`);
	});
}

const unban = async(client, guild, id) => {
    let roleID = client.config.leagues.find((l) => l.config.id == guild.id).config.ranked.banRole;
    let role = guild.roles.find((r) => r.id == roleID);
    if (!role) return console.log(`Couldn't find role: ${roleID} whilst unbanning user from ranked in ${guild.name}.`);

    let member = await guild.fetchMember(id);
    if (!member) return console.log("Member left the discord? Ranked unbans.");

    if (!member.roles.has(role.id)) return console.log("[PDCL v3] Tried to unban user automatically, they appear to already be unbanned.");
    member.removeRole(role).catch(console.error);
    console.log(`[PDCL v3] Unbanned ${member.user.tag} from ranked in ${guild.name}.`);
}

const log = async(client, guild, id) => {
    let member = await guild.fetchMember(id);
    if (!member) return;    
    
    // const logEmbed = new client.djs.RichEmbed()
    // .setAuthor(member.user.tag, member.user.displayAvatarURL)
    // .setDescription(`A member has been unbanned from ranked.`)
    // .addField("Member:", member.user.tag, true)
    // .addField(`Unbanned By:`, client.user.tag, true)
    // .addField("Reason:", "Auto")
    // .setColor("WHITE")
    // .setFooter("Ranked Bans")
    // .setTimestamp();

    const dmEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .setDescription(`You have been **unbanned from ranked** in **${guild.name}**.`)
    .addField(`Unbanned By:`, client.user.tag)
    .addField("Reason:", "Auto")
    .setColor("WHITE")
    .setFooter("Ranked Bans")
    .setTimestamp();

    let rankedLog = guild.channels.find((c) => c.name.toLowerCase() == "ranked-ban-log");
    // rankedLog.send({embed: logEmbed}).catch(console.error);
    member.user.send({embed: dmEmbed}).catch(console.error);
}

exports.time = 60000 * 1 * 60;
