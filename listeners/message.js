module.exports = async (client, message) => {
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
	if (home && league) { // League is sometimes undefined
		
		// XP to be added for sending a message (between 15 and 25)
		let randXP = (Math.floor(Math.random() * 10) + 15); 
		// Table that corrosponds to message.guild's xp storage.
		let table = client.config.leagues.find((l) => l.config.name == league).config.level_table; 
		// An Array of all users with XP in this guild.
		const leagueLevelData = league == "community" ? client.levels["global"] : client.levels[league]; 

		// The user that sent this message, to whom the XP will be given.
		let userLevelData = leagueLevelData.find((u) => u.id == message.author.id);
		// If the user is not in the cache, this must be their first message, so create them in cache
		if (!userLevelData) {
			userLevelData = await client.insertNewUser(message.author.id, league).catch(e => console.log(e));
			console.log('after creating user')
		}

		let userCooldown = client.globalCooldowns.get(message.author.id);
        if (!userCooldown) userCooldown = 0;

		if (Date.now() > userCooldown) {	
            client.globalCooldowns.set(message.author.id, Date.now() + 60000);		
            
            // user's level before adding randXP. To be used to determine if randXP was enough to level them up.
			let oldLevel = leagueLevelData.some((u) => u.id == message.author.id) ? leagueLevelData.find((u) => u.id == message.author.id).level : 0;
			let lvlUpdatesEntry = client.levelUpdates.find((entry) => entry.id === message.author.id && entry.table === table);
            
			// League Specific Update:
			// If there is no entry, insert a new one.
            if (!lvlUpdatesEntry) {                
                client.levelUpdates.push({
					id: message.author.id,
					xp: randXP,
					table: table,
					type: 'newUser'
                });
                lvlUpdatesEntry = client.levelUpdates.find((entry) => entry.id === message.author.id && entry.table === table);
			} else {
				// Otherwise add the XP to the entry.
                lvlUpdatesEntry.xp += randXP;
			}
			// Add randXP to cached version
			userLevelData.xp += randXP;

            // Global Update: Only run if we've only added local XP (aka, not the community discord).
            if (league !== "community") {
                let entry = client.levelUpdates.find((entry) => entry.id == message.author.id && entry.table === "global_levels");
                let userLevelData_g = client.levels["global"].find((u) => u.id == message.author.id);
                if (!userLevelData_g) userLevelData_g = await client.insertNewUser(message.author.id, "community").catch(e => console.log(e));
                
                if (!entry) {
                    client.levelUpdates.push({
                        id: message.author.id,
                        xp: userLevelData_g.xp + randXP,
						table: "global_levels",
						type: 'newUser'
                    });

                    entry = client.levelUpdates.find((entry) => entry.id === message.author.id && entry.table === table);
                } else {
                    entry.xp += randXP;
				}
				userLevelData_g.xp += randXP;
            }

            // Check for level updates AND UPDATE if true
			let newLevel = client.calculateLevelData(userLevelData.xp).level;
			// console.log(oldLevel)
			// console.log(newLevel)
			// console.log(oldLevel < newLevel)
			// console.log(userLevelData.xp)
			if (oldLevel < newLevel) {
				console.log(`${message.author.id}/${message.author.username} Leveled up from ${oldLevel} to ${newLevel}`);
                // message.channel.send(`Congratulations ${message.author}! You reached level ${newLevel}!`);
                userLevelData.level = newLevel;
            }
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