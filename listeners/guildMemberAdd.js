module.exports = async (client, member) => {
	let guild = member.guild;
	let home = client.config.homeGuilds.includes(guild.id);
	if (!home) return;

	// Initially check if the member was created the same day that they joined:
	let createdAt = member.user.createdAt;
	let joinedAt = member.joinedAt;
	let user = member.user;
	let sameDay = compareDays(createdAt, joinedAt);

	let muteRole = guild.roles.find((r) => r.name.toLowerCase() == "muted");
	if (!muteRole) return console.log(`[PDCL v3] Failed to find the 'Muted' role in ${guild.name}.`);

	if (sameDay) {
		
		member.addRole(muteRole.id).catch((e) => console.log(`Error whilst adding muted role: ${e}`));

		// Log:
		const joinMutedEmbed = new client.djs.RichEmbed()
			.setAuthor(user.tag, user.displayAvatarURL)
			.setDescription(`A member has joined the guild. Current Guild Size: ${guild.memberCount} members.`)
			.addField("Additional Information:", "Member has been automatically muted because the account joined the guild on the same day as creation.")
			.setColor("RED")
			.setFooter("Automatic Mute on Join")
			.setTimestamp();

		let channel = guild.channels.find((c) => c.name.toLowerCase() == "join-log");
		if (!channel) return console.log(`[PDCL v3] Failed to find 'join-log' in ${guild.name}.`);

		channel.send({ embed: joinMutedEmbed });

		const dmEmbed = new client.djs.RichEmbed()
			.setAuthor(client.user.tag, client.user.displayAvatarURL)
			.setDescription(`You have been **muted** in **${guild.name}**.`)
			.addField("Reason:", "Automatic - Your account creation is the same day as the day you joined the guild. This is to prevent people bypassing mutes. If you are a legitimate new account, contact a member of the league's management team.")
			.addField("Time:", "N/A")
			.setColor("LUMINOUS_VIVID_PINK")
			.setFooter("Automatic on User Join")
			.setTimestamp();

		user.send({ embed: dmEmbed }).catch(console.error);
	} else {
		const joinEmbed = new client.djs.RichEmbed()
			.setAuthor(user.tag, user.displayAvatarURL)
			.setDescription(`A user has joined the guild. Current Guild Size: ${guild.memberCount} members.`)
			.addField("Additonal Information:", "None")
			.setColor("GREEN")
			.setFooter("Join Logs")
			.setTimestamp()

		let channel = guild.channels.find((c) => c.name.toLowerCase() == "join-log");
		if (!channel) return console.log(`[PDCL v3] Failed to find 'join-log' in ${guild.name}.`);

		channel.send({ embed: joinEmbed });
	}

	// Now check to see if they have existing mute information:
	let db = client.databases.get("discord");
	const [rows, fields] = await db.execute(`SELECT * FROM mute_data WHERE league_id = "${guild.id}" AND target_id = "${user.id}" AND expiry > ${Date.now()}`)
		.catch(e => console.log(`[PDCL v3] Error whilst querying for mute data: ${e}.`));

	if (!rows.length) return;

	member.addRole(muteRole.id).catch((e) => console.log(`Error whilst adding role: ${e}.`));

	// Logging and DM's:
	const logEmbed = new client.djs.RichEmbed()
		.setAuthor(user.tag, user.displayAvatarURL)
		.setDescription("A member has been muted - automatically on guild join.")
		.addField("Target:", user.tag, true)
		.addField("Reason:", "Auto - Prevent Leave/Join Bypass", true)
		.addField("Time:", "N/A", true)
		.setColor("LUMINOUS_VIVID_PINK")
		.setFooter("Automatic on User Join")
		.setTimestamp();

	const dmEmbed = new client.djs.RichEmbed()
		.setAuthor(client.user.tag, client.user.displayAvatarURL)
		.setDescription(`You have been **muted** in **${guild.name}**.`)
		.addField("Reason:", "Automatic - You have an existing mute.")
		.addField("Time:", "N/A")
		.setColor("LUMINOUS_VIVID_PINK")
		.setFooter("Automatic on User Join")
		.setTimestamp();

	let mutelog = guild.channels.find((c) => c.name.toLowerCase() == "mutelog");
	mutelog.send({ embed: logEmbed });
	user.send({ embed: dmEmbed }).catch(console.error);
}

const compareDays = (d1, d2) => {
	let isSame = (d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate());
	return isSame;
}