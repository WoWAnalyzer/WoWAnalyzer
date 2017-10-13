const Discord = require('discord.js');
const client = new Discord.Client();

// https://discordapp.com/oauth2/authorize?&client_id=368144406181838861&scope=bot&permissions=3072

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setGame('WoWAnalyzer.com');
});

client.on('message', msg => {
  if (msg.author.bot) {
    return;
  }
  const content = msg.content;
  // TODO: create a group for the # part of the WCL URL
  const match = content.trim().match(/^(.*reports\/)?([a-zA-Z0-9]{16})\/?(#.*)?(.*)?$/);
  if (match && match[2]) {
    // TODO: filter for fight=XX and source=XX for #444
    msg.channel.send(`https://wowanalyzer.com/report/${match[2]}`);
  }
});

client.login(process.env.DISCORD_TOKEN);
