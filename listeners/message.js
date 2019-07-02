module.exports = async(client, message) => {
    // Disable DM's: Saves a lot of time in other commands.
    if (message.author.bot) return;
    if (message.channel.type !== "text") return;

    // Absence of prefix check for spamwatch:
    let home = client.config.homeGuilds.includes(message.guild.id);
    let hub = client.config.hubs.includes(message.channel.id);
    let league = await client.guildData.get(message.guild.id);
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
    
	// Add XP - Extract this to its own util function?
	if (home) {
		let table = client.config.leagues.find((l) => l.config.name == league).config.level_table;
        const levelData = league == "community" ? client.levels["global"] : client.levels[league]; 

		let userData = levelData.find((u) => u.id == message.author.id);
		if (!userData) userData = client.insertNewUser(message.author.id, league);
		let memberCd = client.globalCooldowns.get(message.author.id);
        if (!memberCd) memberCd = 0;

		if (Date.now() > memberCd) {	
            client.globalCooldowns.set(message.author.id, Date.now() + 60000);		
            
            // Add to cached updates in client#levelUpdates.
			let oldLevel = levelData.find((u) => u.id == message.author.id).level;
			let entry = client.levelUpdates.find((entry) => entry.id === message.author.id && entry.table === table);
            
            // League Specific Update:
            if (!entry) {                
                client.levelUpdates.push({
					id: userData.id,
					xp: (Math.floor(Math.random() * 10) + 15),
					table: table
                });

                entry = client.levelUpdates.find((entry) => entry.id === message.author.id && entry.table === table);
			} else {
                entry.xp += (Math.floor(Math.random() * 10) + 15);
            }

            // Global Update: Ignore 'Community' levels as will have already been added above.
            if (league !== "community") {
                let entry = client.levelUpdates.find((entry) => entry.id === message.author.id && entry.table === "global_levels");
                let globalXPData = client.levels["global"].find((u) => u.id === message.author.id);
                
                if (!entry) {
                    client.levelUpdates.push({
                        id: userData.id,
                        xp: globalXPData.xp + (Math.floor(Math.random() * 10) + 15),
                        table: "global_levels"
                    });

                    entry = client.levelUpdates.find((entry) => entry.id === message.author.id && entry.table === table);
                } else {
                    entry.xp += (Math.floor(Math.random() * 10) + 15);
                }
            }

            // I have no idea what you meant by these two lines btw:
			let newLevel = client.calculateLevelData(entry.xp).level;
			if (oldLevel < newLevel) message.channel.send(`Congratulations ${message.author}! You reached level ${newLevel}!`);
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

    if (!league && command !== "setleague") return message.channel.send("Please configure a league for this guild first. Use !setleague.");
    message.home = home;
    message.league = league;
    message.hub = hub;

    if (prefix == "?") {
        cmd.help(client, message, args);
    } else {
        cmd.run(client, message, args);
	}
}