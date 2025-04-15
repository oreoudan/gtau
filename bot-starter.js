// Discord Bot Starter for Replit
// This file is designed to keep the bot running on Replit

import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Keep the Replit alive
function keepAlive() {
  console.log("Bot is running. Press Ctrl+C to stop.");
  setInterval(() => {
    console.log("Bot is still running: " + new Date().toISOString());
  }, 60000); // Log every minute to keep the process alive
}

// Set up file paths for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Starting ASOLOLE Discord Bot...");

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
console.log("Loading commands...");
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const commandPath = `./commands/${file}`;
  import(commandPath).then((commandModule) => {
    const command = commandModule.default;
    client.commands.set(command.name, command);
    console.log(`Command loaded: ${command.name}`);
  });
}

// Import events using dynamic import for ESM
console.log("Loading events...");
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
    console.log(`Event loaded: ${event.name}`);
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
  client.user.setActivity(statuses[statusIndex]);
  statusIndex = (statusIndex + 1) % statuses.length;
  setTimeout(rotateStatus, 5000);
}

// Handle errors to prevent crashes
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// When the client is ready, set up status rotation
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  rotateStatus();
  keepAlive();
});

// Login to Discord with the token
console.log("Connecting to Discord...");
client.login(process.env.DISCORD_TOKEN).catch(error => {
  console.error("Failed to login to Discord:", error.message);
  console.log("Please check your DISCORD_TOKEN in .env file");
});