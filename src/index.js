/* eslint-disable no-unused-vars */
require('dotenv').config();
const twitchApi = require('./auth/twitch-api.js');
const streamers = require('./streamers.js');
const twitch = require('./api/twitch.js');

// 10 seconds interval between checking for streams
const checkForStreamsInterval = 10000;
// ================================================ DISCORD BOT ================================================
const Discord = require('discord.js');
// create a new Discord client
const client = new Discord.Client();
const { PREFIX: prefix, DISCORD_BOT_TOKEN: token } = require('./config.js');

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
	console.log('Ready!');
});

// twitchpollinterval is used to start and stop the setInterval
// started polling is used to make sure not to start multiple setInterval calls through the bot
let twitchPollInterval;
const pollTimer = 10000;
let startedPolling = false;

client.on('message', async (message) => {
	// make sure we start with our prefix, and make sure the message does not come from the bot itself
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	// cut off the prefix and seperate the args via space
	// '/ +/' this reges makes sure to remove extra spaces so we don't end up with "here,,,,are,,,my,,,,,args"
	const args = message.content.slice(prefix.length).split(/ +/);
	// will take first element in array and return it while also removingit from the original array
	// so that you don't have the command name string inside the args array
	const command = args.shift().toLowerCase();

	// TODO create a Commandhandler
	// TODO refactor into own files
	basicCommands(message, args, command);

	// call our twitch commands
	twitchCommands(message, args, command);

	console.log(message.content);
});

// this has to be the last line of bot code
// login to Discord with your app's token
client.login(token);
// ================================================ DISCORD BOT ================================================

function basicCommands(message, args, command) {
	if (command === 'ping') {
		message.channel.send('pong!');
	} else if (command === 'beep') {
		message.channel.send('boop!');
	} else if (command === 'server') {
		message.channel.send(
			`Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}`,
		);
	} else if (command === 'user-info') {
		message.channel.send(
			`Your username: ${message.author.username}\nYour ID: ${message.author.id}!`,
		);
	} else if (command === 'info') {
		if (!args.length) {
			return message.channel.send(
				`You didn't provide any arguments, ${message.author}!`,
			);
		} else if (args[0] === 'foo') {
			return message.channel.send('bar');
		}

		message.channel.send(`First argument: ${args[0]}`);
	} else if (command === 'kick') {
		if (!message.mentions.users.size) {
			return message.reply('you need to tag a user in order to kick them!');
		}

		const taggedUser = message.mentions.users.first();

		message.channel.send(`You wanted to kick: ${taggedUser.username}`);
	}
}

async function twitchCommands(message, args, command) {
	if (command === 'app') {
		if (!args.length) {
			return message.channel.send(
				`You didn't provide any arguments, ${message.author}!\nTry !app help to see commands`,
			);
		} else if (args[0] === 'help') {
			return message.channel.send(
				`These are the commands: !app \nstart,\nstop,\nadd,\nlist,\nhelp. ${message.author}`,
			);
		} else if (args[0] === 'start') {
			if (startedPolling) {
				return message.channel.send(`App already running. ${message.author}`);
			}
			message.channel.send(`Starting process... ${message.author}`);
			twitch.startTwitchPollingInterval(message);
			startedPolling = true;
		} else if (args[0] === 'stop') {
			startedPolling = false;
			twitch.stopTwitchPollingInterval();
			return message.channel.send(`Stopped polling for twitch streamers. ${message.author}`);
		} else if (args[0] === 'add') {
			// TODO this doesn't work properly, if a user doesn't exist it still gets added to the list
			const channels = args.slice(1);
			const channelNames = channels.join(' ');
			console.log(`These are the channels to search for ${channelNames} their length ${channelNames.length}`);
			const streamer = await twitchApi.getUsers(channelNames);
			console.log(streamer);
			if(streamer) {
				channels.forEach(channel =>{
					streamers.addStreamer(channel);
				});
				message.channel.send(`Added ${channels} to the list. ${message.author}`);
			}else {
				return message.channel.send(`${channels} does not exist. ${message.author}`);
			}
		} else if (args[0] === 'list') {
			let msg = 'You are watching: ';
			streamers.getStreamerArray().forEach((streamer) => {
				// **name** is markup for bolding in discord chat
				msg += `\n-**${streamer.name}**`;
			});
			console.log(msg);
			message.channel.send(msg);
		}
	}
}
