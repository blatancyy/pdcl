module.exports = async (client, dbName) => {
	let db = client.databases.get(dbName);
	return Promise.resolve(db);
}