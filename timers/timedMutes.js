exports.run = async (client) => {
	const db = client.databases.get("discord");
	const [rows, fields] = await db.execute("SELECT * FROM mute_data").catch(e => console.log("[PDCL v3] Error whilst querying for mutes."));

	if (!rows.length) return console.log("[PDCL v3] Did not find any entries for mute timers.");

	rows.forEach(async (entry) => {
		let guild = client.guilds.get(entry.league_id);
		let member = await guild.fetchMember(userObj);
		if (!member) return;

		let expired = entry.expiry > Date.now() && member.roles.some(r => r.name.toLowerCase() === 'muted');
		if (expired == true) return;

		let global = entry.global == 1 ? true : false;
		if (global) {
			client.config.homeGuilds.forEach((id) => {
				let league = client.guilds.get(id);
				if (!league) return console.log(`[PDCL v3] Something went wrong: Failed to find guild in unmute timer.`);

				unmute(client, league, entry.target_id);
			});
		} else {
			let league = client.guilds.get(entry.league_id);
			if (!league) return console.log(`[PDCL v3] Something went wrong: Failed to find guild in unmute timer.`);

			unmute(client, league, entry.target_id);
			log(client, league, entry.target_id);
		}

		// Remove row.
		// db.execute(`DELETE FROM mute_data WHERE id = ${entry.id}`);

		

		const dmEmbed = new client.djs.RichEmbed()
			.setAuthor(client.user.tag, client.user.displayAvatarURL)
			.setDescription(`You have been **unmuted** in **${guild.name}**.`)
			.addField("Reason:", "Auto", true)
			.addField("Global ?", global ? "True" : "False", true)
			.setColor("GREEN")
			.setFooter("PDCL Bot v2.0")
			.setTimestamp();

		let user = await client.fetchUser(entry.target_id);
		user.send({ embed: dmEmbed }).catch(console.error);

		if (global) log(client, guild, entry.target_id, true);
	});
}

const unmute = async (client, guild, id) => {
	let role = guild.roles.find((r) => r.name.toLowerCase() == "muted");
	if (!role) return console.log(`Failed to unmute user: did not find 'Muted' role in ${guild.name}.`);

	let userObj = await client.fetchUser(id);
	let foundMember = await guild.fetchMember(userObj);
	if (!foundMember) return;

	if (!foundMember.roles.has(role.id)) return;
	foundMember.removeRole(role).catch(console.error);
	console.log(`[PDCL v3][Mute Timers] Unmuted ${userObj.tag} in ${foundMember.guild.name}.`);
}

const log = async (client, guild, id, global) => {
	let user = await client.fetchUser(id);
	let foundMember = await guild.fetchMember(user).catch((e) => console.log("[PDCL v3][Timed Unmutes] Member is no longer in guild."));
	if (!foundMember) return;

	let channel = global ? client.channels.get("548965999961964555") : guild.channels.find((c) => c.name == "mutelog");
	if (!channel) return console.log("[PDCL v3] Didn't find channel when logging timed unmute.")

	// const logEmbed = new client.djs.RichEmbed()
	// 	.setAuthor(client.user.tag, client.user.displayAvatarURL)
	// 	.setDescription("A member has been unmuted.")
	// 	.addField("Target:", user.tag, true)
	// 	.addField("Reason:", "Auto", true)
	// 	.setColor("GREEN")
	// 	.setFooter("PDCL Bot v2.0")
	// 	.setTimestamp();

	// channel.send({ embed: logEmbed });
}


exports.time = 60000 * 2;
