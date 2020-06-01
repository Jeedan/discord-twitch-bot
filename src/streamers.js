// store streamers that we watch for now
const streamerArray = [];
// TODO REFACTOR
// will need to be changed maybe use mongo instead
function addStreamer(name, announced = false) {
	const streamer = { name: '', announced: false };
	streamer.name = name;
	streamer.announced = announced;

	streamerArray.push(streamer);
}

function getStreamerArray() {
	return streamerArray;
}
// TODO REFACTOR
addStreamer('mathil1', false);
addStreamer('dansgaming', false);
addStreamer('itmejp', false);
addStreamer('beiruthen', false);

// list streamers
// for (var i = 0; i < streamerArray.length; i++) {
//   console.log(`${streamerArray[i].name} is live and status is ${streamerArray[i].announced}`);
// }
// console.log(`testing ${JSON.stringify(streamerArray)}`);

module.exports = {
	addStreamer,
	getStreamerArray,
};