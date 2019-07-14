module.exports = async(client) => {
    console.log(`Successfully logged in as ${client.user.tag}, serving ${client.guilds.size} guids.`);
    client.user.setPresence({ game: { name: 'PDCL Bot | !invite' }, status: 'dnd' });
    
    await client.attatchTimers();
    client.loadGuildData();
    client.loadRosterData();
    client.loadLevelData(client);
    client.calculateStartElo(client);
    
    const message = await client.channels.get("554150703392620558").fetchMessage("554444085717630977");
    console.log(`[PDCL v3] Successfully cached message for league roles : ${message.content}.`);
}
