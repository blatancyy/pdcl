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
    
    // If we are continuing with levels, will have to do that here:
    // :D

    // Cute way to enable multiple prefixes:
    let prefixes = client.config.prefixes;
    let prefix = false;

    for (const p of prefixes) if (message.content.startsWith(p)) prefix = p;
    if (!prefix) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const cmd = client.commands.get(command);
    if (!cmd) return;

    const league = await client.guildData.get(message.guild.id);
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