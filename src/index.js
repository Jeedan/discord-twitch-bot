require('dotenv').config();
const twitchApi = require('./auth/twitch-api.js');

// 10 seconds interval between checking for streams
const checkForStreamsInterval = 10000;

// test array for the streamers to check
// this will be populated via the discord bot command '/add-streamers <name>'
// const streamerList = ['mathil1', 'itmejp', 'dansgaming'];

const streamerArray = [];

function displayTimeStamp() {
	const today = new Date();
	const date = `${today.getFullYear()}/${
		today.getMonth() + 1
	}/${today.getDate()}`;
	const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;

	return `${date} ${time}`;
}

// maybe refactor into another file
const announceStreamIsLive = async (streamer_name) => {
	try {
		const stream = await twitchApi.getStreams(streamer_name);
		if (stream) {
			console.log(`${streamer_name} is live!`);
		} else {
			console.log(`${streamer_name} is currently offline!`);
		}
	} catch (err) {
		// console.log(`${streamer_name} is currently offline!`);
		console.error(err);
	}
};

// try long polling for getting streamer information
const longPollStreamer = async (streamer) => {
	try {
		const { name } = streamer;
		const stream = await twitchApi.getStreams(streamer.name);

		if (stream) {
			if (streamer.announced) return;
			console.log(`${name} is live! ... ${displayTimeStamp()}`);
			streamer.announced = true;
		} else {
			streamer.announced = false;
			console.log(`long polling for...${name}...${displayTimeStamp()}`);
			console.log(
				`${name} is currently offline! announced: ${streamer.announced}`
			);
			// wait one second then try again
			// await new Promise((resolve) => setTimeout(resolve, checkForStreamsInterval * 2));
			// await longPollStreamer(streamer);
		}
	} catch (err) {
		console.error(err);
	}
};

const checkLongPollStreams = async () => {
	setInterval(() => {
		console.log('***********************************************************');
		twitchApi.getUsers();
		console.log(`${displayTimeStamp()}`);
		// loop through the streams in the array and announce them
		pollAllStreamers();
		// check once a minute
	}, checkForStreamsInterval * 6);
};

function pollAllStreamers() {
	streamerArray.forEach((stream) => {
		longPollStreamer(stream);
	});
}

function addStreamer(name, announced) {
	const streamer = { name: '', announced: false };
	streamer.name = name;
	streamer.announced = announced;

	streamerArray.push(streamer);
}

addStreamer('dansgaming', false);
addStreamer('mathil1', false);
addStreamer('itmejp', false);
addStreamer('beiruthen', false);

// for (var i = 0; i < streamerArray.length; i++) {
//   console.log(`${streamerArray[i].name} is live and status is ${streamerArray[i].announced}`);
// }
// console.log(`testing ${JSON.stringify(streamerArray)}`);

// to test the api
twitchApi.getUsers();
announceStreamIsLive('jeedanjune');
console.log(`${displayTimeStamp()}`);

console.log('***********************************************************');

// checkForStreams();
checkLongPollStreams();
