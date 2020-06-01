/* eslint-disable no-unused-vars */
require('dotenv').config();
const twitchApi = require('./auth/twitch-api.js');
// 10 seconds interval between checking for streams
const checkForStreamsInterval = 10000;
// store streamers that we watch for now
const streamerArray = [];
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

// TODO REFACTOR
addStreamer('dansgaming', false);
addStreamer('mathil1', false);
addStreamer('itmejp', false);
addStreamer('beiruthen', false);

// for (var i = 0; i < streamerArray.length; i++) {
//   console.log(`${streamerArray[i].name} is live and status is ${streamerArray[i].announced}`);
// }
// console.log(`testing ${JSON.stringify(streamerArray)}`);
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

function twitchCommands(message, args, command) {
	if (command === 'app') {
		if (!args.length) {
			return message.channel.send(
				`You didn't provide any arguments, ${message.author}!\nTry !app help to see commands`,
			);
		} else if (args[0] === 'help') {
			return message.channel.send(
				`These are the commands: !app start,stop,help. ${message.author}`,
			);
		} else if (args[0] === 'start') {
			if (startedPolling) {
				return message.channel.send(`App already running. ${message.author}`);
			}
			message.channel.send(`Starting process... ${message.author}`);
			startTwitchPollingInterval(message);
			startedPolling = true;
		} else if (args[0] === 'stop') {
			startedPolling = false;
			if (twitchPollInterval) {
				console.log(`stopped: ${twitchPollInterval}`);
				clearInterval(twitchPollInterval);
				return message.channel.send(
					`Stopped polling for twitch streamers. ${message.author}`,
				);
			}
			return message.channel.send(`TODO in construction. ${message.author}`);
		}else if(args[0] === 'add') {
			const name = args[1];
			const streamer = twitchApi.getUsers(name);
			console.log(streamer);
			addStreamer(name);
		} else if(args[0] === 'list') {
			let msg = 'You are watching: ';
			streamerArray.forEach((streamer) => {
				// **name** is markup for bolding in discord chat
				msg += `\n-**${streamer.name}**`;

			});
			console.log(msg);
			message.channel.send(msg);
		}
	}
}

function displayTimeStamp() {
	const today = new Date();
	const date = `${today.getFullYear()}/${
		today.getMonth() + 1
	}/${today.getDate()}`;
	const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;

	return `${date} ${time}`;
}

function startTwitchPollingInterval(message) {
	pollAllStreamersForBot(message);

	twitchPollInterval = setInterval(
		() => pollAllStreamersForBot(message),
		pollTimer,
	);
}

function pollAllStreamersForBot(message) {
	// call getUsers with no parameters to see my own ratelimit usage
	twitchApi.getUsers();

	streamerArray.forEach((stream) => {
		longPollStreamer(stream, message);
	});
	console.log('***********************************************************');
}

function pollAllStreamers() {
	streamerArray.forEach((stream) => {
		longPollStreamer(stream);
	});
}

// try long polling for getting streamer information
const longPollStreamer = async (streamer, message) => {
	try {
		const { name } = streamer;
		const stream = await twitchApi.getStreams(name);

		if (stream) {
			if (streamer.announced) return;
			console.log(`${name} is live! ... ${displayTimeStamp()}`);
			if (message) {
				message.channel.send(
					`${name} is live!\nGo watch over at https://twitch.tv/${name}`,
				);
			}
			streamer.announced = true;
		} else {
			streamer.announced = false;
			console.log(
				`long polling for...${name}...${displayTimeStamp()}\n${name} is currently offline!`,
			);
			// if(message) message.channel.send(`${name} is currently offline!`);
		}
	} catch (err) {
		console.error(err);
	}
};

const PollStreamers = async (streamer) => {
	try {
		const { name } = streamer;
		const stream = await twitchApi.getStreams(streamer.name);

		if (stream) {
			if (streamer.announced) return;
			console.log(`${name} is live! ... ${displayTimeStamp()}`);
			streamer.announced = true;
		} else {
			streamer.announced = false;
			console.log(
				`long polling for...${name}...${displayTimeStamp()}\n${name} is currently offline!`,
			);
		}
	} catch (err) {
		console.error(err);
	}
};

// will need to be changed maybe use mongo instead
function addStreamer(name, announced = false) {
	const streamer = { name: '', announced: false };
	streamer.name = name;
	streamer.announced = announced;

	streamerArray.push(streamer);
}

// consider renaming this when the bot is ready
const checkLongPollStreams = async () => {
	setInterval(() => {
		console.log('***********************************************************');
		twitchApi.getUsers();
		console.log(`${displayTimeStamp()}`);
		// loop through the streams in the array and announce them
		pollAllStreamers();
		// check every thirty seconds
	}, checkForStreamsInterval * 3);
};

function twitchTest() {
	// to test the api
	twitchApi.getUsers();
	console.log(`${displayTimeStamp()}`);
	console.log('***********************************************************');
	// checkForStreams();
	checkLongPollStreams();
}
