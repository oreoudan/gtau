// Simple script to run the bot with Node.js
console.log('Starting Discord bot...');

// Import bot
import('./index.js').catch(err => {
  console.error('Failed to start the bot:', err);
});