module.exports = async(client) => {
    const db = client.databases.get("discord");
    const [rows, fields] = await db.execute("SELECT * FROM global_levels").catch(console.error);
    
    // Community Discord
    const guild = client.guilds.get("542848649202499584");

    rows.forEach(async(row) => {
        let id = row.id;
        let member = await guild.fetchMember(id).catch((e) => console.log("User isn't in community discord."));
        if (!member) return;

        let xp = row.xp;
        let level = client.utils.get("calculateLevelData")(xp).level;
        let levelTree = client.config.leagues.find((l) => l.config.name == "community").levelTree;
        
        var index = -1;
        levelTree.forEach((l) => {
            if (level >= l.level) index++;
        });

        let milestone = levelTree[index];
        if (!milestone) return;

        let role = guild.roles.find((r) => r.name == milestone.roleName);
        if (member.roles.has(role.id)) return;
        await member.addRole(role).catch(console.error);

        console.log(`Successfully applied role: ${milestone.roleName} to ${member.user.tag}!`);        
    });
}