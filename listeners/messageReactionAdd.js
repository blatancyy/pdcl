module.exports = async(client, reaction, user) => {
    const message = reaction.message;
    if (message.id !== "554444085717630977") return;

    // Members are not always cached, this is to ensure the bot doesn't crash.
    let member = await message.guild.fetchMember(user.id);
    if (!member) return message.author.send("Something went wrong when adding your league role. Tag fred. (Not cached?)");

    let id = await client.communityRoles.get(reaction.emoji.id);
    let role = await message.guild.roles.get(id);
    if (!role) return console.log(`[PDCL v3] Failed to find role for respective emoji: ${reaction.emoji.name}.`);

    if (member.roles.has(role)) return;
    member.addRole(role).catch(console.error);
}
