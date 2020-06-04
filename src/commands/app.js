const twitch = require('../auth/twitch.js');
const twitchAPI = require('../api/twitch-api.js');

const streamers = require('../streamers.js');

let startedPolling = false;

/* eslint-disable no-unused-vars */
module.exports = {
	name : 'app',
	description : 'This holds the commands to start, add, list and stop twitch API calls and relay them to the discord bot!',
	async execute(message, args) {

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
			twitchAPI.startTwitchPollingInterval(message);
			startedPolling = true;
		} else if (args[0] === 'stop') {
			startedPolling = false;
			twitchAPI.stopTwitchPollingInterval();
			return message.channel.send(`Stopped polling for twitch streamers. ${message.author}`);
		} else if (args[0] === 'add') {
			// TODO this doesn't work properly, if a user doesn't exist it still gets added to the list
			const channels = args.slice(1);
			const channelNames = channels.join(' ');
			const streamer = await twitch.getUsers(channelNames);
			const channelList = [];
			// console.log(`These are the channels to search for ${channelNames} their length ${channelNames.length}`);
			// console.log(streamer);
			if(streamer.length > 0) {
				streamer.forEach(stream =>{
					console.log(stream);
					if(!stream) {
						return message.channel.send(`${stream.login} skipped because it does not exist. ${message.author}`);

					}else {
						console.log(stream.login);
						streamers.addStreamer(stream.login);
						channelList.push(stream.login);
					}
				});
				return message.channel.send(`Added ${channelList.join(' ')} to the list. ${message.author}`);
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

	},
};