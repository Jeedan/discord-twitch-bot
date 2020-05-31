require('dotenv').config();
const axios = require('axios');
const config = require('./config.js');
const twitch_api = require('./auth/twitch-api.js');

//10 seconds interval between checking for streams
const checkForStreamsInterval = 10000;

// test array for the streamers to check
// this will be populated via the discord bot command '/add-streamers <name>'
const streamerList = ['mathil1', 'itmejp', 'dansgaming'];

const streamerArray = [];

function displayTimeStamp() {
  const today = new Date();
  const date = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
  const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;

  return (dateTime = `${date} ${time}`);
}

const checkForStreams = async () => {
  setInterval(() => {
    console.log('***********************************************************');
    twitch_api.getUsers();
    announceStream('JeedanJune');
    // loop through the streams in the array and announce them
    streamerArray.forEach((stream) => {
      announceStream(stream);
    });
    // streamerList.forEach((stream) => {
    //   announceStreamIsLive(stream);
    // });
  }, checkForStreamsInterval);
};

// maybe refactor into another file
const announceStreamIsLive = async (streamer_name) => {
  try {
    const stream = await twitch_api.getStreams(streamer_name);
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
    const stream = await twitch_api.getStreams(streamer.name);

    if (stream) {
      if (streamer.announced) return;
      console.log(`${name} is live! ... ${displayTimeStamp()}`);
      streamer.announced = true;
    } else {
      streamer.announced = false;
      console.log(`long polling for...${name}...${displayTimeStamp()}`);
      console.log(`${name} is currently offline! announced: ${streamer.announced}`);
      console.log(``);
      // wait one second then try again
      //await new Promise((resolve) => setTimeout(resolve, checkForStreamsInterval * 2));
      //await longPollStreamer(streamer);
    }
  } catch (err) {
    console.error(err);
  }
};

const checkLongPollStreams = async () => {
  setInterval(() => {
    console.log('***********************************************************');
    twitch_api.getUsers();
    console.log(`${displayTimeStamp()}`);
    // loop through the streams in the array and announce them
    pollAllStreamers();
  }, checkForStreamsInterval);
};

function pollAllStreamers() {
  streamerArray.forEach((stream) => {
    longPollStreamer(stream);
  });
}

function addStreamer(name, announced) {
  let streamer = { name: '', announced: false };
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
//console.log(`testing ${JSON.stringify(streamerArray)}`);

// to test the api
twitch_api.getUsers();
announceStreamIsLive('jeedanjune');
console.log(`${displayTimeStamp()}`);

console.log('***********************************************************');

//checkForStreams();
checkLongPollStreams();
