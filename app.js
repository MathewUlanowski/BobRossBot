import fetch from 'node-fetch';
import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, DiscordRequest } from './utils.js';
import { generateResponse } from './src/Controllers/GPTController.js';

const fetch = require('node-fetch');
const { AzureFunction, Context } = require('@azure/functions');

module.exports = async function (context, req) {
  const { type, data, token, channel_id, message } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return {
      status: 200,
      body: { type: InteractionResponseType.PONG },
    };
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    try {
      if (name === 'ask-bob') {
        // Defer the response
        context.res = {
          status: 200,
          body: {
            type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
          },
        };

        let gptResponse = await generateResponse(data.options[0].value);

        // Send a PATCH request to the Discord API to edit the original message
        let response = await fetch(
          `https://discord.com/api/v8/webhooks/${process.env.APP_ID}/${token}/messages/@original`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
            },
            body: JSON.stringify({
              content: `**you asked bob:** ${data.options[0].value}\n**bob says:** ${gptResponse}`,
            }),
          }
        );

        console.log(response.status);
      }
    } catch (error) {
      console.error(error);
      context.res = {
        status: 200,
        body: {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `An error occurred while processing your request. Please try again later.`,
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        },
      };
    }
  }

  context.done();
};
