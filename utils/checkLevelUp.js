module.exports = (client, message, oldLevel, newLevel) => {
	if (oldLevel < newLevel) {
		console.log(`${message.guild.id}/${message.author.username} Leveled up from ${oldLevel} to ${newLevel}`);
		// message.channel.send(`Congratulations ${message.author}! You reached level ${newLevel}!`);
		
		let leagueInfo = client.config.leagues.find((l) => l.config.id == message.guild.id);
		if (!leagueInfo) console.log(`[PDCL v3] League not found.`)
		else {
			leagueInfo.levelTree.forEach((milestone) => {
				let role = message.guild.roles.find((r) => r.name == milestone.roleName);
				if (!role) return console.log(`[PDCL v3] Couldn't find role milestone for level: ${newLevel} in ${message.guild.name}.`)

				if (milestone.level == newLevel && !message.member.roles.find((r) => r.name === role.name)) message.member.addRole(role).catch((e) => console.error);
			});
		}
		return newLevel;
	}
}