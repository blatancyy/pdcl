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
        this.request_promise = require("request-promise");

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
		this.playerElos = new Map();
		this.playerStartingElo = new Map();
        this.databases = new this.djs.Collection();
		this.spamWatch = new this.djs.Collection();
		this.globalCooldowns = new this.djs.Collection();
		this.guildData = new this.djs.Collection();
        this.config = require("./config.json");
    
		this.levelUpdates = [];
		this.filteredWords = [];
		this.levels = {};
        this.players = {};
        this.teams = {};
    }

    async attachCommands() {
        this.fs.readdir("./commands/", async(e, files) => {
            if (e) return console.log(`[PDCL v3] Error whilst reading listener dir: ${e}`);
            if (!files) return console.error("[PDCL v3] Error whilst reading command directory.");
		
			let commands = [];
            for ( const file of files) {
                if (!file.endsWith(".js")) return;
                let path = require(`./commands/${file}`);
                let name = file.split(".")[0];
				let aliases = path.aliases;

                
				this.commands.set(name, path);
				
				if (aliases) {
					for (var a of aliases) {
						if (this.commands.get(a)) return console.log(`Error: alias ${a} has already been registered.`);
						else this.commands.set(a, path);
					}
				}
				commands.push(name);
			};
			console.log(`[PDCL V3] Attached commands: ${commands.map(c => c).join(', ')}.`);
        });
    }

    async attatchTimers() {
        this.fs.readdir("./timers/", async(e, files) => {
            if (e) return console.log(`[PDCL v3] Error whilst reading listener dir: ${e}`);
            if (!files) return console.error("[PDCL v3] Error whilst reading timer directory.");
	
			let timers = [];
            files.forEach((file) => {
                if (!file.endsWith(".js")) return;
                let path = require(`./timers/${file}`);
                let name = file.split(".")[0];
    
                
                const runTimer = () => path.run(this);
                setInterval(runTimer, path.time);

				this.timers.set(name, path);
				timers.push({name, time: path.time / 1000})
			});
			console.log(`[PDCL v3] Attached timers: ${timers.map(t => `${t.name} - ${t.time} seconds`).join(', ')} `);
        });
    }

    async registerListeners() {
        this.fs.readdir("./listeners/", (e, listeners) => {
            if (e) return console.log(`[PDCL v3] Error whilst reading listener dir: ${e}`);
            if (!listeners) return console.log("[PDCL v3] Error whilst reading listener directory.");

			let registered = [];
            listeners.forEach((file) => {
                if (!file.endsWith(".js")) return;
                let path = require(`./listeners/${file}`);
                let name = file.split(".")[0];
                
				this.on(name, path.bind(null, this));
				
				registered.push(name);
			});
			console.log(`[PDCL v3] Registered Listeners: ${registered.map(r => r).join(', ')}.`);
        });
    }

    async attatchUtils() {
        this.fs.readdir("./utils/", (e, utils) => {
            if (e) return console.log(`[PDCL v3] Error whilst reading util dir: ${e}`);
			if (!utils) return console.log("Didn't find any utils");
			
			let attached = [];

            for (const file of utils) {
                if (!file.endsWith(".js")) return;
                let path = require(`./utils/${file}`);
                let name = file.split(".")[0];

				attached.push(name);
                this[name] = path;
			};
			console.log(`[PDCL v3] Attached Utils: ${attached.map(u => u).join(', ')}.`);
        });
    }

	async loadDatabase (name, database) {		
		const connection = await this.mysql.createPool({
			connectionLimit: 40,
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
		let dbs = [];
		this.loadDatabase("discord", "mpcleagu_discord"); 
        leagueData.forEach((league) => {
			this.loadDatabase(league.config.name, league.config.database);
			dbs.push(league.config.name.toUpperCase());
            
		});
		
		console.log(`[PDCL v3] Loaded database for DISCORD, ${dbs.map(u => u).join(', ')}.`);               
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

		this.filteredWords = [];
		const [wordList, wfields] = await db.execute('SELECT * FROM bad_words')
			.catch(() => console.log(`[PDCL v3] Error whilst querying for bad_words`));
		wordList.forEach(r => {
			this.filteredWords.push(r.word);
		});
    }

    // Called in ./listeners/ready.js 
	async loadRosterData () {
		
		let rosters = [];
        for (const league of this.config.leagues) {
            let name = league.config.name;

            let db = this.databases.get(name);
            if (!db) return console.log(`[PDCL v3] Didn't find database for: ${name}.`);

            this.players[name] = [];
            this.teams[name] = [];

			let [rows, fields] = await db.execute("SELECT * FROM players;")
				.catch(e => console.log(`[PDCL v3] Error whilst loading players w/ db: ${name}. \nError: ${e}`));
			
            this.players[name] = rows;

			[rows, fields] = await db.execute("SELECT * FROM teams WHERE hidden = 0")
				.catch(e => console.log(`[PDCL v3] Error whilst loading teams w/ db: ${name}. \nError: ${e}`));
			
			this.teams[name] = rows;

			rosters.push(name.toUpperCase());
		};
		console.log(`[PDCL v3] Successfully loaded player and roster data for: ${rosters.map(r => r).join(', ')}.`);
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