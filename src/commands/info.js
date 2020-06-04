/* eslint-disable no-unused-vars */

// TODO REFACTOR
// add functionality to add and remove commands
// store commands in a database
// check if the command already exists before creating duplicates
//
module.exports = {
	name : 'info',
	args : true,
	guildOnly: true,
	cooldown: 5,
	usage: '<text> <text> <text>',
	description : 'Information about the arguments provided!',
	execute(message, args) {
		if (args[0] === 'foo') {
			return message.channel.send('bar');
		}

		message.channel.send(`Arguments: ${args}\nArguments length: ${args.length}`);
	},
};