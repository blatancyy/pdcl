exports.run = (client, message, args) => {
    if (!client.config.eval.includes(message.author.id)) return;
    let error = false;
    const input = args.join(" ");
    let output = "";

    try {
        output = eval(input);
    } catch (err) {
        output = err;
        error = true;
    }

    // Remove token:
    const exp = new RegExp(client.config.credentials.token, "g");
    if (typeof output == "string") output = output.replace(exp, "[REDACTED]");

    message.channel.send(`**📥 INPUT**\`\`\`JS\n${input}\n\`\`\`\n**${error ? "❗ ERROR ❗" : "📤 OUTPUT"}**\n\`\`\`JS\n${output}\n\`\`\``).catch(console.error);
}

exports.help = (client, message, args) => {
    if (message.hub) return;

    const helpEmbed = new client.djs.RichEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL)
    .addField("Description:", "Evaluate raw JavaScript code. Highly restricted access.")
    .addField("Usage:", "`!eval <statement>`")
    .setColor("DARK_AQUA")
    .setFooter("!eval")
    .setTimestamp();

    message.channel.send({embed: helpEmbed});
}