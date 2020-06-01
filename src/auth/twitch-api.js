/* eslint-disable no-unused-vars */
const axios = require('axios');
const config = require('../config.js');

const auth_url = 'https://id.twitch.tv/oauth2';
const api_url = 'https://api.twitch.tv/helix';

// get a token test
const getAccessToken = async () => {
	const qs = new URLSearchParams({
		grant_type: 'client_credentials',
		client_id: config.TWITCH_CLIENT_ID,
		client_secret: config.TWITCH_CLIENT_SECRET,
	});

	await axios
		.post(`${auth_url}/token?${qs}`)
		.then((res) => {
			console.log(res.data);
		})
		.catch((err) => console.error(err));
};

const getRefreshToken = async () => {
	const qs = new URLSearchParams({
		grant_type: 'refresh_token',
		refresh_token: config.ACCESS_TOKEN,
		client_id: config.TWITCH_CLIENT_ID,
		client_secret: config.TWITCH_CLIENT_SECRET,
	});

	await axios
		.post(auth_url + qs)
		.then((res) => console.log(res.data))
		.catch((err) => console.error(err));
};

// small test
// refactor to get user by id/token instead of hard coding
const getUsers = async (login_name = 'jeedanjune') => {
	// const userParamPath = userParams(login_name);
	// console.log(userParamPath);
	// old /users?login=${login_name}
	await axios
		.get(`${api_url}/users?login=${login_name}`, {
			headers: {
				'Client-ID': config.TWITCH_CLIENT_ID,
				Authorization: 'Bearer ' + config.ACCESS_TOKEN,
			},
		})
		.then((resp) => {
			if (resp.data.data[0]) {
				if (login_name === 'jeedanjune') {
					console.log(
						`${resp.data.data[0].display_name}'s rate limit ${resp.headers['ratelimit-remaining']}/${resp.headers['ratelimit-limit']}`,
					);
				} else {
					console.log(`${resp.data.data[0].display_name} found!`);
				}
			} else {
				console.log(`${login_name} this user does not exist!`);
			}
		})
		.catch((err) => console.error(err));
};

// refactor getUsers to accept multiple users and return an array of data
function userParams(login_names) {
	if(login_names.length < 2) return;
	let loginUrl = '/users?';
	login_names.forEach(login =>{
		loginUrl += `login=${login}&`;
	});

	return loginUrl;
}

const getStreams = async (streamer_name) => {
	const {
		data: { data },
	} = await axios
		.get(`${api_url}/streams?user_login=${streamer_name}`, {
			headers: {
				'Client-ID': config.TWITCH_CLIENT_ID,
				Authorization: 'Bearer ' + config.ACCESS_TOKEN,
			},
		})
		.catch((err) => {
			console.error(err);
		});
	return data[0] || null;
};

module.exports = {
	getUsers,
	getStreams,
	getAccessToken,
};
