const twitch = require('../auth/twitch.js');
const streamers = require('../streamers.js');

// twitchpollinterval is used to start and stop the setInterval
// started polling is used to make sure not to start multiple setInterval calls through the bot
let twitchPollInterval;
const pollTimer = 10000;

function stopTwitchPollingInterval() {
	if (!twitchPollInterval) return;
	console.log(`stopped: ${twitchPollInterval}`);
	clearInterval(twitchPollInterval);
}

function startTwitchPollingInterval(message) {
	pollAllStreamersForBot(message);

	twitchPollInterval = setInterval(
		() => pollAllStreamersForBot(message),
		pollTimer,
	);
}

async function pollAllStreamersForBot(message) {

	console.log('***********************************************************');
	streamers.getStreamerArray().forEach((stream) => {
		longPollStreamer(stream, message);
	});
	// call getUsers with no parameters to see my own ratelimit usage
	await twitch.getUsers();
}

// try long polling for getting streamer information
const longPollStreamer = async (streamer, message) => {
	try {
		const { name } = streamer;
		const stream = await twitch.getStreams(name);

		if (stream) {
			if (streamer.announced) return;
			console.log(`${name} is live! ... ${displayTimeStamp()}`);
			if (message) {
				message.channel.send(
					`**${name} is live!**\nGo watch over at https://twitch.tv/${name}`,
				);
			}
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

function displayTimeStamp() {
	const today = new Date();
	const date = `${today.getFullYear()}/${
		today.getMonth() + 1
	}/${today.getDate()}`;
	const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;

	return `${date} ${time}`;
}

module.exports = {
	startTwitchPollingInterval,
	stopTwitchPollingInterval,
	pollAllStreamersForBot,
	displayTimeStamp,
};