// Adds a new user to levelUpdates
module.exports = async (client, id, league) => {
	// const db = client.databases.get("discord");
	let leagueLevelData = league == "community" ? client.levels["global"] : client.levels[league];

	// If a user by the ID already exists, reject.
	if (leagueLevelData.some(userObj => userObj.id === id))
		return Promise.reject(`[PDCL v3] User ${id} already exists in cache.`);

	let entry = { id, xp: 0, table: league == "community" ? "global_levels" : `new_${league}_levels`, type: 'newUser' };
	client.levelUpdates.push(entry);
	leagueLevelData.push(entry);
	console.log('pushed new user to levelUpdates');

	let newEntry = leagueLevelData.find((u) => u.id == id);
	console.log(newEntry)

	if (!newEntry) return Promise.reject(`Couldn't get result from cache!`);
	else return Promise.resolve(newEntry);
}