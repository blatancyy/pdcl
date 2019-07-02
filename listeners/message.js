module.exports = async(client, message) => {
    // Disable DM's: Saves a lot of time in other commands.
    if (message.author.bot) return;
    if (message.channel.type !== "text") return;

    // Absence of prefix check for spamwatch:
    let home = client.config.homeGuilds.includes(message.guild.id);
    let hub = client.config.hubs.includes(message.channel.id);
    if (home && (message.mentions.members.size || message.mentions.roles.size)) {
        let user = client.spamWatch.get(message.author.id);
        if (!user) client.spamWatch.set(message.author.id, {m: message.member, c: 2});

        if (user) {
            user.c++;
            if (user.c >= 5) {
                let role = message.guild.roles.find((r) => r.name.toLowerCase() == "muted");
                if (!role) return console.log(`[PDCL v3] Could not find 'Muted' role in ${message.guild.name}.`);
                
                message.member.addRole(role).catch(console.error);
                message.channel.send(`${message.author} : You been automatically muted for spamming mentions.`);
            }

            setTimeout(() => user.c--, 5000);
        }
	}
	
	const league = await client.guildData.get(message.guild.id);
    if (!league && command !== "setleague") return message.channel.send("Please configure a league for this guild first. Use !setleague.");
    message.home = home;
    message.league = league;
    message.hub = hub;
    
    // If we are continuing with levels, will have to do that here:
	// :D
	// Add XP - Extract this to its own util function?
	if (message.author.bot) return;
	const leagueName = message.guild.id == "542848649202499584" ? "global" : message.league;
	if (leagueName) {
		const leagueTableName = client.config.leagues.find(l => l.name === leagueName).config.level_table;
		const levelData = client.levels[message.league];

		let userData = levelData.find((u) => u.id == message.author.id);
		if (!userData) await client.insertNewUser(message.author.id, leagueName);
		
		let memberCd = client.globalCooldowns.get(userData.id);
		if (!memberCd) client.globalCooldowns.set(userData.id, Date.now() + 60000);
		else if (memberCd < Date.now()) {
			
			// Push to updates
			let oldLevel = client.levels.find((u) => u.id == message.author.id && u.guildID == leagueName).level;

			let entry = levelUpdates.find(entry => entry.id === userData.id && entry.table === leagueTableName);
			if (!entry) {
				client.levelUpdates.push({
					id: userData.id,
					xp: userData.xp + (Math.floor(Math.random() * 10) + 15),
					table: leagueTableName
				});
			} else entry.xp = userData.xp + (Math.floor(Math.random() * 10) + 15);

			client.globalCooldowns.set(userData.id, Date.now() + 60000);

			let newLevel = client.memberUpdates.level;
			if (oldLevel < newLevel) message.channel.send(`Congrats ${message.author}! You reached level ${newLevel}`);
		}
	}
    // Cute way to enable multiple prefixes:
    let prefixes = client.config.prefixes;
    let prefix = false;

    for (const p of prefixes) if (message.content.startsWith(p)) prefix = p;
    if (!prefix) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const cmd = client.commands.get(command);
    if (!cmd) return;

	// Moved message.league stuff above xp/level addition

    if (prefix == "?") {
        cmd.help(client, message, args);
    } else {
        cmd.run(client, message, args);
	}
}