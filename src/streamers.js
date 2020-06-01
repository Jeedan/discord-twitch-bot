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

module.exports = {
	addStreamer,
	getStreamerArray,
};