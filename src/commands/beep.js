/* eslint-disable no-unused-vars */
module.exports = {
	name : 'beep',
	description : 'Beep!',
	execute(message, args) {
		message.channel.send('Boop.');
	},
};