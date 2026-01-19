import { Client, GatewayIntentBits } from 'discord.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import logger from './logger';
import { startHealthServer } from './health';
import { callWithRetry } from './openaiClient';

dotenv.config();

// Use only the Guilds intent since we're using slash commands (no Message Content intent required)
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// If a DISCORD_TOKEN is not provided, run in a lightweight simulation mode so `npm run dev` demonstrates message flow locally.
if (!process.env.DISCORD_TOKEN) {
  logger.warn('DISCORD_TOKEN not set — starting in SIMULATION mode.');
  try {
    const port = Number(process.env.PORT) || 3000;
    startHealthServer(port);
  } catch (err) {
    logger.error(`Failed to start health server (simulation): ${String(err)}`);
  }

  (async () => {
    logger.info('Simulation: invoking OpenAI via callWithRetry to demonstrate message flow');
    try {
      const response = await callWithRetry(() =>
        // simulated successful OpenAI-like response
        Promise.resolve({ choices: [{ message: { content: "Happy little simulation: I'm your friendly Bob Ross bot (simulated)." } }] }),
      );
      const botReply = response.choices?.[0]?.message?.content || 'No reply from simulation';
      logger.info(`Simulation: bot would reply: ${botReply}`);
    } catch (err) {
      logger.error(`Simulation failed: ${String(err)}`);
    }
  })();
} else {
  // Use only the Guilds intent since we're using slash commands (no Message Content intent required)
  client.once('ready', () => {
    logger.info('Bob Ross Bot is online!');

    // start health server for readiness/liveness probes
    try {
      const port = Number(process.env.PORT) || 3000;
      startHealthServer(port);
    } catch (err) {
      logger.error(`Failed to start health server: ${String(err)}`);
    }

    // Register slash command `/bobross`.
    // If GUILD_ID is provided, register it to that guild for immediate availability (recommended for testing).
    const command: RESTPostAPIChatInputApplicationCommandsJSONBody = {
      name: 'bobross',
      description: 'Ask Bob Ross a question',
      options: [
        {
          name: 'prompt',
          description: 'What would you like to ask Bob Ross?',
          type: 3, // STRING
          required: true,
        },
      ],
    };

    (async () => {
      try {
        if (process.env.GUILD_ID) {
          const guild = await client.guilds.fetch(process.env.GUILD_ID);
          await guild.commands.create(command);
          logger.info(`Registered /bobross in guild ${process.env.GUILD_ID}`);
        } else if (client.application) {
          await client.application.commands.create(command);
          logger.info('Registered global /bobross (may take up to an hour to appear)');
        }
      } catch (err) {
        logger.error(`Failed to register slash command: ${String(err)}`);
      }
    })();
  });
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'bobross') return;

  const prompt = interaction.options.getString('prompt', true);

  await interaction.deferReply();

  try {
    const response = await callWithRetry(() =>
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are Bob Ross, the painter. Respond in a calm and encouraging tone.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
      }),
    );
    const botReply =
      response.choices?.[0]?.message?.content ||
      'Oh no, the happy little clouds are blocking my thoughts.';
    logger.info(`Responding to /bobross: ${botReply.slice(0, 200)}`);
    await interaction.editReply(botReply);
  } catch (error) {
    logger.error(`Error communicating with OpenAI: ${String(error)}`);
    await interaction.editReply('Oops, something went wrong while painting this response.');
  }
});
if (process.env.DISCORD_TOKEN) {
  client
    .login(process.env.DISCORD_TOKEN)
    .catch((err) => logger.error(`Failed to login: ${String(err)}`));
} else {
  logger.warn('Not attempting Discord login (DISCORD_TOKEN missing).');
}
