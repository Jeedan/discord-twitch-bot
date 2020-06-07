# discord-twitch-bot
A Discord bot that announces when a streamer goes live!

## About this project
This is supposed to be a small bot that I am programming for my discord. I got annoyed with twitch notifications being sometimes up to an hour late and missing parts of a stream.

## What does the bot do?
The bot will have a couple of commands, mainly add/remove a streamer that you want to keep track of. Maybe there will be more commands but I want to get a minimum viable product working first! 

When the bot has a list of streamers, he uses the twitch API to poll for them and check whether they are live or not and display information accordingly. For cleanliness the bot only displays whether a streamer is live to not spam a channel. 

## Resources
I am using these links as my main resources for the program:

- [The twitch API!](https://dev.twitch.tv/docs/api) for all your API needs
- [How to get an oauth token.](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth)
    - This is used to get an app access token for authentication and authorization with twitch.
    - When we have a token we can perform api calls using the helix api.
- [Discord.js getting started guide](https://discordjs.guide/)
    - As I have never written a bot as well as never used discord.js before I am following the introduction guide showcased on their site. Very useful to get you started and explained nicely!