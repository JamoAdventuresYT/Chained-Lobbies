const { Client, GatewayIntentBits, SlashCommandBuilder, Routes } = require('discord.js');
const admin = require('firebase-admin');

// 1. Setup Firebase Admin
admin.initializeApp({
  databaseURL: "YOUR_FIREBASE_URL_HERE"
});
const db = admin.database();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // --- COMMAND: /create ---
  if (interaction.commandName === 'create') {
    // Generate a 6-digit random code like "MONKE1"
    const lobbyId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    await db.ref(`lobbies/${lobbyId}`).set({
      host: interaction.user.tag,
      roomCode: "NONE" // The mod will update this later
    });

    await interaction.reply({
      content: `🍌 **Lobby Created!**\nYour Secret ID: \`${lobbyId}\`\n\n**Instructions:**\n1. Put this ID into your Mod Menu.\n2. Give this ID to your friend so they can /join!`,
      ephemeral: true 
    });
  }

  // --- COMMAND: /join ---
  if (interaction.commandName === 'join') {
    const lobbyId = interaction.options.getString('id').toUpperCase();
    const snapshot = await db.ref(`lobbies/${lobbyId}`).once('value');

    if (snapshot.exists()) {
      await interaction.reply({
        content: `🔗 **Chained to ${lobbyId}!**\nEnter this ID into your Mod Menu to follow the host.`,
        ephemeral: true
      });
    } else {
      await interaction.reply({ content: "❌ That Lobby ID doesn't exist!", ephemeral: true });
    }
  }
});

client.login('YOUR_DISCORD_BOT_TOKEN');
