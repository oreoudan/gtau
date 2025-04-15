import 'dotenv/config';
import { Client, GatewayIntentBits, Collection, ActivityType } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Set up collections for commands and music queues
client.commands = new Collection();
client.queues = new Map();
client.djRoles = new Map();

// Bot prefix
client.prefix = '=';

// Import commands using dynamic import for ESM
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const commandPath = `./commands/${file}`;
  import(commandPath).then((commandModule) => {
    const command = commandModule.default;
    client.commands.set(command.name, command);
  });
}

// Import events using dynamic import for ESM
const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const eventPath = `./events/${file}`;
  import(eventPath).then((eventModule) => {
    const event = eventModule.default;
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  });
}

// Status rotation
const statuses = [
  'Music',
  `${client.prefix}help`,
  `Prefix ${client.prefix}`,
  'Global music access',
  'DJ role system'
];

let statusIndex = 0;

// Rotate status every 5 seconds
function rotateStatus() {
  client.user.setActivity(statuses[statusIndex], { type: ActivityType.Playing });
  statusIndex = (statusIndex + 1) % statuses.length;
  setTimeout(rotateStatus, 5000);
}

// Note: Status rotation is now handled in the ready.js event
// We don't need this event handler anymore since we're using the ready.js event file
// client.on('ready', () => {
//   console.log(`Logged in as ${client.user.tag}!`);
//   rotateStatus();
// });

// Login to Discord with the token
client.login(process.env.DISCORD_TOKEN);