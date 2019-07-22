exports.run = async (client, message, args) => {
	if (!message.home) return;

	// Check permissions using role names:
    const muteRoles = ["developer", "referee", "management", "director", "global", "leadership", "trial referee", "chat moderator"];

    var hasPerms = false;
    muteRoles.forEach((name) => {
        let role = message.guild.roles.find((r) => r.name.toLowerCase() == name);
        if (role !== null && message.member.roles.has(role.id)) hasPerms = true;
    });

	if (!hasPerms) return;
	
	let amount = args[0];
	if (isNaN(amount)) return message.channel.send(`'amount' must be a number.`);
	if (amount < 2) return message.channel.send(`'amount' should be more than 1.`);

	message.channel.send(`Are you sure you want to purge the ${amount} most recent messages in this channel? Reply with 'yes' or 'no'.`);
	let responses = await message.channel.awaitMessages(msg => msg.author.id == message.author.id, { max: 1, time: 120000, errors: ['time'] })
		.catch(() => console.log('Time ran out, canceling message purge.'));
	let response = responses.first();

	if (response.content.toLowerCase() != 'yes') return message.channel.send(`Canceling message purge.`);
	amount += 3;
	await message.channel.bulkDelete(amount).catch(console.log)
	console.log(`bulkDelete of ${amount} messages in ${message.channel.name} by ${message.author.username} was successful.`);
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Purge `amount` of messages in this channel. Staff only.")
    .addField("Usage:", "`!purge <amount>`", true)
    .addField("Example", "`!purge 15`", true)
    .setColor("DARK_AQUA")
    .setFooter("!purge")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}