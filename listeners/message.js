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
	
	// Check content for slurs in league discords
	let content = message.content.replace(/:regional_indicator_\w:/g, (match) => match.slice(20, -1)).toLowerCase().split(/\s+/);
	if (home && content.some(w => client.filteredWords.indexOf(w) !== -1)) {

		if (message.member.roles.some(r => ["developer", "leadership", "global"].includes(r.name.toLowerCase()))) return;
		message.delete();

		let role = message.guild.roles.find((r) => r.name.toLowerCase() == "muted");
		if (!role) return console.log(`[PDCL v3] Could not find 'Muted' role in ${message.guild.name}.`);
		if (message.member.roles.has(role.id)) return console.log('Someone sent a slur while muted?');

		message.member.addRole(role).catch(console.error);

		const leagues = client.config.homeGuilds;
        leagues.forEach(async(league) => {
            let guild = await client.guilds.get(league);
            if (!guild) return console.log(`[PDCL v3] Something went wrong whilst fetching guild w/ id ${league}.`);

            // Using guild#fetchMember in case they aren't cached in guild#members, it takes a UserResolvable arg.
            let user = message.author;
            let member = await guild.fetchMember(user).catch((e) => console.log("Member is not in all guilds."));
            if (!member) return;

            let role = guild.roles.find((r) => r.name.toLowerCase() == "muted");    
            if (!role) return console.log(`Did not find a role in ${member.guild.name}.`);
            
            if (member.roles.has(role.id)) return;
			member.addRole(role).catch(console.error);
		});

		const query = `INSERT INTO mute_data (discord, league, expiry, global) VALUES ("${message.author.id}", "${message.guild.id}", "${Date.now() + 86400000}", 1);`;
		const db = client.databases.get("discord");
		db.execute(query).catch(e => console.log(`[PDCL v3] Error whilst querying mute information: \n${e}`));

		// const logEmbed = new client.djs.RichEmbed()
		// 	.setAuthor(client.user.tag, client.user.displayAvatarURL)
		// 	.setDescription("A member has been muted.")
		// 	.addField("Target:", message.author.tag, true)
		// 	.addField("Reason:", 'Auto-detected slur', true)
		// 	.addField("Time:", '1d', true)
		// 	.setColor("ORANGE")
		// 	.setTimestamp();
		
		const dmEmbed = new client.djs.RichEmbed()
			.setAuthor(client.user.tag, client.user.displayAvatarURL)
			.setDescription(`You have been **muted** in **${message.guild.name}**.`)
			.addField("Reason:", 'Auto-detected slur', true)
			.addField("Time:", '1d', true)
			.addField("Global ?", "True", true)
			.setColor("ORANGE")
			.setTimestamp();

		let mutelog = global ? client.channels.get("548965999961964555") : message.guild.channels.find((c) => c.name == "mutelog");
	    // mutelog.send({embed: logEmbed});
		message.author.send({embed: dmEmbed}).catch(console.error);
	}
	
    // Check count-to: id is community count to channel id:
    if (message.channel.id == "554149057673560074") {
        let valid = await client.checkCountTo(client, message);
        if (!valid) {
            message.delete().catch(console.error);
            message.author.send(`Your message in ${message.channel} has been deleted because it appears to be invalid for the 'count-to' feature. \nIncorrect? Let me know @ fred#5775.`);
        } 
    }

    // Run Dev's retarded emoji function:
    client.devsReactions(client, message);
    
	// Add XP - Extract this to its own util function?
	if (home && league) {
		
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
			userLevelData = await client.insertNewUser(client, message.author.id, league).catch(e => console.log(e));
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
					type: 'oldUser'
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

				let oldLevel_g = leagueLevelData.some((u) => u.id == message.author.id) ? leagueLevelData.find((u) => u.id == message.author.id).level : 0;
                let lvlUpdatesEntry_g = client.levelUpdates.find((entry) => entry.id == message.author.id && entry.table === "global_levels");
				
				let userLevelData_g = client.levels["global"].find((u) => u.id == message.author.id);
                if (!userLevelData_g) userLevelData_g = await client.insertNewUser(client, message.author.id, "community").catch(e => console.log(e));
                
                if (!lvlUpdatesEntry_g) {
                    client.levelUpdates.push({
                        id: message.author.id,
                        xp: randXP,
						table: "global_levels",
						type: 'oldUser'
                    });

                    lvlUpdatesEntry_g = client.levelUpdates.find((entry) => entry.id === message.author.id && entry.table === table);
                } else {
                    lvlUpdatesEntry_g.xp += randXP;
				}
				userLevelData_g.xp += randXP;

				let newLevel_g = client.calculateLevelData(userLevelData.xp).level;
				userLevelData.level = client.checkLevelUp(client, message, oldLevel_g, newLevel_g);
			}
			
			let newLevel = client.calculateLevelData(userLevelData.xp).level;
			userLevelData.level = client.checkLevelUp(client, message, oldLevel, newLevel);
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