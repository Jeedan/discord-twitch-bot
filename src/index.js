/* eslint-disable no-unused-vars */
require('dotenv').config();
const streamers = require('./streamers.js');
const twitchAPI = require('./api/twitch-api.js');
const twitch = require('./auth/twitch.js');

// ================================================ DISCORD BOT ================================================
const Discord = require('discord.js');
// create a new Discord client
const client = new Discord.Client();
const { PREFIX: prefix, DISCORD_BOT_TOKEN: token } = require('./config.js');

// node's file system module
const fs = require('fs');

// discord collection, similar to Map but more functionality
client.commands = new Discord.Collection();

// retrieve all files from the commands folder that end with .js
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

// loop through all command files and store them in the discord collection
for(const file of commandFiles) {
	const command = require(`./commands/${file}`);

	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.name, command);
}

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
	console.log('Ready!');
});

// twitchpollinterval is used to start and stop the setInterval
// started polling is used to make sure not to start multiple setInterval calls through the bot

const startedPolling = false;
const commandCooldowns = new Discord.Collection();

client.on('message', async (message) => {
	// make sure we start with our prefix, and make sure the message does not come from the bot itself
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	// cut off the prefix and seperate the args via space
	// '/ +/' this reges makes sure to remove extra spaces so we don't end up with "here,,,,are,,,my,,,,,args"
	const args = message.content.slice(prefix.length).split(/ +/);
	// will take first element in array and return it while also removingit from the original array
	// so that you don't have the command name string inside the args array
	const commandName = args.shift().toLowerCase();

	// if the discord collection does not containt the command return
	if(!client.commands.has(commandName)) return;

	const command = client.commands.get(commandName);

	// 	You check if the cooldowns Collection has the command set in it yet. If not, then add it in. Next, 3 variables are created:
	if(!commandCooldowns.has(command.name)) {
		commandCooldowns.set(command.name, new Discord.Collection());
	}

	// A variable with the current timestamp.
	// A variable that .get()s the Collection for the triggered command.
	// A variable that gets the necessary cooldown amount. If you don't supply it in your command file,
	// it'll default to 3. Afterwards, convert it to the proper amount of milliseconds.
	const now = Date.now();
	const timestamps = commandCooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if(timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if(now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	// if timestamps doe snot have the message author yet, we set it manually and update it with current time
	// then we delete the timestamp after the cooldown
	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	// get the command with the specified name and arguments from the collection and execute it
	try{

		// if the command has arguments set to true but hasn't set arguments
		if(command.args && !args.length) {
			let reply = `You didn't provide any arguments, ${message.author}! `;
			// display usage if applicable
			if(command.usage) {
				reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
			}

			if(command.guildOnly && message.channel.type !== 'text') {
				return message.reply('I can\'t execute that command inside DMs!');
			}
			return message.channel.send(reply);

		}

		client.commands.get(commandName).execute(message, args);
	} catch(err) {
		console.error(err);
		message.reply('There was an error trying to execute that command!');
	}

	console.log(message.content);
});

// this has to be the last line of bot code
// login to Discord with your app's token
client.login(token);
// ================================================ DISCORD BOT ================================================

