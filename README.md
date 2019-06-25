<p align = center>
    <img src = "https://cdn.discordapp.com/attachments/542871083276173312/583768746313646090/Podcrash--MCL-Logo-25.png">
</p>

# <p align = center>PDCL BOT V2.0</p>
#### About

The PDCL Bot is the primary discord bot for the [Podcrash Competitive League](https://mpcleague.com/) community and encompasses roster and player commands, global discord moderation and other miscellaneous features.

You may add the PDCL Bot to your discord [here](https://discordapp.com/oauth2/authorize?client_id=276485094674399233&scope=bot&permissions) . When adding the PDCL bot to your guild, use the `!setleague` command to set individual guild configurations. 

You can view the changelog for the PDCL Bot [here.](https://github.com/blatancyy/pdcl/releases)


#### The Project

**Status:** Ongoing active maintenance. 

The PDCL Bot was initially created by Qata and is now maintained by the current PDCL development team including fred, RainDance and WinterBeyond. 

The application uses [discord.js](https://discord.js.org/#/docs/main/stable/general/welcome) to interact with the Discord API and produce a fully functional bot application. If you are further interested on how the bot works, read [here](#developer-information) . If you wish to contribute to the project, you may use this repository or even [apply for developer.](https://forums.mpcleague.com/forums/dev-app/)

#### License

This project is registered under the [GNU General Public License v3](https://opensource.org/licenses/GPL-3.0). 


#### Issues & Help

If you encounter any issues whilst using the PDCL Bot, please alert them to the development team. The easiest way to do this is to message me - fred#5775 -  through discord, though you may wish to use another contact method. Likewise, if you require assistance, I'll always respond to any queries you have.

---



#### PDCL Bot Wiki

Runs in a nodejs environment using: [discord.js](https://www.npmjs.com/package/discord.js), [mysql](https://www.npmjs.com/package/mysql) and [fs](https://nodejs.org/api/fs.html). 

The entry point for the bot is located in `./process.js` which creates a new Client instance found in `./index.js`. It extends the standard Client class in discord.js and listens to the process for unhandled exceptions & rejections.

All commands can be found in `./commands/` and should be nested inside a `run` function. All commands are supplied with the `client, message, args `arguments. Read more about how they are constructed in `listeners/message.js` . The name of the file corresponds to the command name.

All listeners can be found in `./listeners/` and like commands, the name of the file corresponds to the event name. The bot currently only covers select events but a full list of events can be found [here](https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-channelCreate). The listener is always supplied with `client` as the first argument, but the next depend on the event.

All timers can be found in `./timers/` and can be called anything. They should be nested inside a `run` function and are only supplied with the `client` argument. Timers should also have a `time` value which represents how often they are run in milliseconds. 
`60000` milliseconds represents 1 minute.





















