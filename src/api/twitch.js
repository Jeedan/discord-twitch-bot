const twitchApi = require('../auth/twitch-api.js');
const streamers = require('../streamers.js');

// twitchpollinterval is used to start and stop the setInterval
// started polling is used to make sure not to start multiple setInterval calls through the bot
let twitchPollInterval;
const pollTimer = 10000;

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

	streamers.getStreamerArray().forEach((stream) => {
		longPollStreamer(stream, message);
	});
	console.log('***********************************************************');
}

function pollAllStreamers() {
	streamers.getStreamerArray().forEach((stream) => {
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

// eslint-disable-next-line no-unused-vars
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

// consider renaming this when the bot is ready
const checkLongPollStreams = async () => {
	setInterval(() => {
		console.log('***********************************************************');
		twitchApi.getUsers();
		console.log(`${displayTimeStamp()}`);
		// loop through the streams in the array and announce them
		pollAllStreamers();
		// check every thirty seconds
	}, pollTimer * 3);
};

// eslint-disable-next-line no-unused-vars
function twitchTest() {
	// to test the api
	twitchApi.getUsers();
	console.log(`${displayTimeStamp()}`);
	console.log('***********************************************************');
	// checkForStreams();
	checkLongPollStreams();
}

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
	pollAllStreamersForBot,
	displayTimeStamp,
};