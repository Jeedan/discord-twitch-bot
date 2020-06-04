/* eslint-disable no-unused-vars */

// TODO REFACTOR
// add functionality to add and remove commands
// store commands in a database
// check if the command already exists before creating duplicates
//
module.exports = {
	name : 'info',
	description : 'Multi arguments command!',
	execute(message, args) {
		message.channel.send(
			`Your username: ${message.author.username}\nYour ID: ${message.author.id}!`,
		);
	},
};