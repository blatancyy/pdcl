const { Client } = require("discord.js");

class Bot extends Client {
    constructor() {
        super();

        // Pass all packages through the client class:
        this.djs = require("discord.js");
        this.mysql = require("mysql2/promise");
        this.fs = require("fs");
        this.keyvPackage = require("keyv");
        this.request = require("request");

        // Emojis for rosters: Don't change the index values, leaguerank stored as int in db.
        this.teamRankMap = new Map().set(0, "").set(1, " 👑").set(2, " 👑");
        this.emojiMap = new Map().set(10, " 🌎").set(9, " ⚜️").set(8, " 🔑").set(6, " 🛡").set(7, " 🛡").set(5, " 🛡").set(4, " 🍉").set(3, " 🎥").set(2, "⚠").set(1, " ⚖").set(0, "");
        this.msclGarbage = new Map().set(5, "<:igl:543047540128350218> ").set(4, "<:awper:543047594041933828> ").set(1, "<:rifler:543047576031592476> ")
            .set(0, "<:support:543047626191405066> ").set(3, "<:entryfragger:543047609926025217> ").set(2, "<:lurker:543047647406325760> ");
        this.leagueColours = new Map().set("ccl", "PURPLE").set("mscl", "ORANGE").set("cwcl", "RED").set("bcl", "GREEN").set("swcl", "BLUE");
        this.communityRoles = new Map().set("554152088171577368", "554150704122560542").set("554152126151131147", "554150842492780554").set("554152162549039108", "554150997417525248")
            .set("554152202046930984", "554151123603292161").set("554152234624090133", "554151248962781199");

        // No reason to vary between vanilla Map and djs' collection, :?
        this.commands = new Map();
        this.timers = new Map();
        this.utils = new Map();
        this.teamPools = new Map();
        this.databases = new this.djs.Collection();
		this.spamWatch = new this.djs.Collection();
		this.globalCooldowns = new this.djs.Collection();
		this.guildData = new this.djs.Collection();
        this.config = require("./config.json");
    
        this.levelUpdates = [];
		this.levels = {};
        this.players = {};
        this.teams = {};
    }

    async attachCommands() {
        this.fs.readdir("./commands/", async(e, files) => {
            if (e) return console.log(`[PDCL v3] Error whilst reading listener dir: ${e}`);
            if (!files) return console.error("[PDCL v3] Error whilst reading command directory.");
        
            files.forEach((file) => {
                if (!file.endsWith(".js")) return;
                let path = require(`./commands/${file}`);
                let name = file.split(".")[0];
				let aliases = path.aliases;

                console.log(`[PDCL V3] Attatching command: ${name}.`);
				this.commands.set(name, path);
				
				if (aliases) {
					for (var a of aliases) {
						if (this.commands.get(a)) return console.log(`Error: alias ${a} has already been registered.`);
						else this.commands.set(a, path);
					}
				}
            });
        });
    }

    async attatchTimers() {
        this.fs.readdir("./timers/", async(e, files) => {
            if (e) return console.log(`[PDCL v3] Error whilst reading listener dir: ${e}`);
            if (!files) return console.error("[PDCL v3] Error whilst reading timer directory.");
    
            files.forEach((file) => {
                if (!file.endsWith(".js")) return;
                let path = require(`./timers/${file}`);
                let name = file.split(".")[0];
    
                console.log(`[PDCL v3] Attatching timer: ${name} to be run every ${path.time / 1000} seconds.`);
                const runTimer = () => path.run(this);
                setInterval(runTimer, path.time);

                this.timers.set(name, path);
            });
        });
    }

    async registerListeners() {
        this.fs.readdir("./listeners/", (e, listeners) => {
            if (e) return console.log(`[PDCL v3] Error whilst reading listener dir: ${e}`);
            if (!listeners) return console.log("[PDCL v3] Error whilst reading listener directory.");

            listeners.forEach((file) => {
                if (!file.endsWith(".js")) return;
                let path = require(`./listeners/${file}`);
                let name = file.split(".")[0];
    
                console.log(`[PDCL v3] Registering Listener: ${name}.`);
                this.on(name, path.bind(null, this));
            });
        });
    }

    async attatchUtils() {
        this.fs.readdir("./utils/", (e, utils) => {
            if (e) return console.log(`[PDCL v3] Error whilst reading util dir: ${e}`);
            if (!utils) return console.log("Didn't find any utils");

            utils.forEach((file) => {
                if (!file.endsWith(".js")) return;
                let path = require(`./utils/${file}`);
                let name = file.split(".")[0];

                console.log(`PDCL v3] Attatching Util: ${name}.`);
                this.utils.set(name, path);
            });
        });
    }

	async loadDatabase (name, database) {		
		const connection = await this.mysql.createPool({
			connectionLimit: 50,
			host: "localhost", 
			user: this.config.credentials.mysql.username,
			password: this.config.credentials.mysql.password,
			database: database
		});

		await connection.getConnection().catch(e => console.log(`[PDCL v3] Error whilst establishing DB connection: \n${e}`));
		let db = this.databases.set(name, connection);
		return db;
    }

    async loadDatabases() {
        const leagueData = this.config.leagues;
        leagueData.forEach((league) => {
            this.loadDatabase(league.config.name, league.config.database);
            console.log(`[PDCL v3] Loaded database for ${league.config.name.toUpperCase()}.`);
        });

        console.log("[PDCL v3] Loaded database for DISCORD.")
        this.loadDatabase("discord", "mpcleagu_discord");        
    }

    async start() {
        await this.attachCommands();
        await this.registerListeners();
        await this.attatchUtils();
        await this.loadDatabases();
        await this.login(this.config.credentials.token);
    }

    // Called in ./listeners/ready.js    
    async loadGuildData () {
        const db = this.databases.get("discord");
        if (!db) return console.log(`[PDCL v3] Something went wrong: Could not load database for guild configs. ('Discord')`);
		const [rows, fields] = await db.execute("SELECT * FROM guild_data")
			.catch(e => console.error(`[PDCL v3] Error whilst querying for guild_data: \n${e}`));
		
		rows.forEach((entry) => {
			this.guildData.set(entry.guild, entry.league);
		});
    }

    // Called in ./listeners/ready.js 
    async loadRosterData () {
        this.config.leagues.forEach(async (league) => {
            let name = league.config.name;
            console.log(`[PDCL v3] Beginning to load roster data for league: ${name}.`)

            let db = this.databases.get(name);
            if (!db) return console.log(`[PDCL v3] Didn't find database for: ${name}.`);

            this.players[name] = [];
            this.teams[name] = [];

			let [rows, fields] = await db.execute("SELECT * FROM players WHERE team_id > 0")
				.catch(e => console.log(`[PDCL v3] Error whilst loading players w/ db: ${name}. \nError: ${e}`));
			
            this.players[name] = rows;

			[rows, fields] = await db.execute("SELECT * FROM teams WHERE hidden = 0")
				.catch(e => console.log(`[PDCL v3] Error whilst loading teams w/ db: ${name}. \nError: ${e}`));
			
			this.teams[name] = rows;

            console.log(`[PDCL v3] Successfully loaded player and roster data for: ${name.toUpperCase()}.`);
        });
	}

	async getDatabasePromise (dbName) {
		let db = this.databases.get(dbName);
		return Promise.resolve(db);
	}
    
    // Called in ./listeners/ready.js 
	async loadLevelData() {
		const db = await this.getDatabasePromise("discord");

		// League Discords:
		this.config.leagues.forEach(async (league) => {
			let table = league.config.level_table;
            let name = league.config.name;
            if (name == "community") return;
	
			console.log(`[PDCL v3] Beginning to load local xp data for league: ${name}.`)
	
			const [rows, fields] = await db.execute(`SELECT * FROM ${table}`)
				.catch(e => console.log(`[PDCL v3] Error whilst loading local xp for ${name}. \nError: ${e}`));

			this.levels[name] = [];
			for (const row of rows) row.level = this.calculateLevelData(row.xp).level;
				
			this.levels[name] = rows;
			this.levels[name].sort((a, b) => b.xp - a.xp);
		});
		
		const [rows, fields] = await db.execute('SELECT * FROM global_levels')
			.catch(e => console.log(`[PDCL v3] Error whilst loading global levels. \nError: ${e}`));
	
		this.levels.global = [];
		for (const row of rows) row.level = this.calculateLevelData(row.xp).level;
			
		this.levels.global = rows;
		this.levels.global.sort((a, b) => b.xp - a.xp);
    }
    
    /*
    async loadGuildData() {
        // keyv extends map. there's documentation online.
        let user = this.config.credentials.mysql.username;
        let pw = this.config.credentials.mysql.password;
        let db = this.config.guildDb;

        console.log(`mysql://${user}:${pw}@localhost:3306/${db}`);

        // mysql://user:pass@localhost:3306/dbname
        this.guildData = new this.keyvPackage(`mysql://${user}:${pw}@localhost:3306/${db}`);
        console.log("[PDCL v3] Attempting to configure keyv connection.")

        this.guildData.on('error', err => console.error('Keyv connection error:', err));        
    }
    */

	// Adds a new user to levelUpdates
	async insertNewUser(id, league) {
        // const db = this.databases.get("discord");
		
		let leagueLevelData = league == "community" ? this.levels["global"] : this.levels[league];

		// If a user by the ID already exists, reject.
		if (leagueLevelData.some(userObj => userObj.id === id))
			return Promise.reject(`[PDCL v3] User ${id} already exists in cache.`);
		
        // db.query(`INSERT INTO ${league == "community" ? "global_levels" : `new_${league}_levels`} (id, xp) VALUES ("${id}", 0)`, async (e) => {
		// 	if (e) return Promise.reject(`[PDCL v3] Error whilst inserting new user to ${league}'s level table in DB. \nError: ${e}`);

		// 	// If this ID already exists in the global table, don't try to insert it again.
		// 	if (league == "community") return;
		// 	db.query(`SELECT * FROM global_levels WHERE id = "${id}"`, async (e, rows) => {

		// 		if (rows.length < 1) return;
		// 		db.query(`INSERT INTO global_levels (id, xp) VALUES ("${id}", 0)`, async (e) => {
		// 			if (e) return Promise.reject(`[PDCL v3] Error whilst inserting new user to 's level table in DB. \nError: ${e}`);
		// 		});
		// 	});
		// });
		// // I've decied to just set them in cache and not reload everything.

		let entry = { id, xp: 0, table: league == "community" ? "global_levels" : `new_${league}_levels`, type: 'newUser' };
		this.levelUpdates.push(entry);
		leagueLevelData.push(entry);
		console.log('pushed new user to levelUpdates');

		let newEntry = leagueLevelData.find((u) => u.id == id);
		console.log(newEntry)

		if (!newEntry) return Promise.reject(`Couldn't get result from cache!`);
		else return Promise.resolve(newEntry);
    }

    calculateLevelData(totalXP) {
		let level = 0;
		let levelXP = totalXP
		let totalToNext = 5 * Math.pow(level, 2) + 50 * level + 100;
		let prevTotalToNext = 0;

		while (totalXP >= totalToNext) {
			level++;
			prevTotalToNext = totalToNext;
			levelXP = totalXP - totalToNext;
			totalToNext += 5 * Math.pow(level, 2) + 50 * level + 100;
		}

		return {
			totalXP,
			levelXP,
			level,
			prevTotalToNext,
			totalToNext
		};
	}
}

// This wrapper function can be used if you want to use promises instead of callbacks.
class Database {
    constructor(connection) {
        this.connection = connection;
		// If this ever gets used be sure to have it use mysql2
        this.query = (statement) => {
            return new Promise((resolve, reject) => {
                this.connection.query(statement, (e, res) => {
                    if (e) return reject(e);
                    resolve(res);
                });
            });
        }
    }
}

module.exports = Bot;