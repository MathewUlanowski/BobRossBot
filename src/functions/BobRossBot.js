import { app } from '@azure/functions';
import 'azure-middleware'
import 'dotenv/config';
import {
    InteractionType,
    InteractionResponseType,
    InteractionResponseFlags,
    MessageComponentTypes,
    ButtonStyleTypes,
    verifyKeyMiddleware,
} from  'discord-interactions';
import 'dotenv/config';
import OpenAI from 'openai';
import { config } from 'dotenv';
import fetch from 'node-fetch';
import { response } from 'express';

config(); // Load environment variables from .env file

async function getGPTResponse(prompt) {

    let oaiKey = process.env.BOBROSSBOTOPENAIAPIKEY;
    let openai = new OpenAI({apiKey: oaiKey});
    try {
      let response = await openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are Bob Ross and will jokingly respond to messages.' 
          },
          {
            role: 'user',
            content: `${prompt}` 
          }
        ],
        model: 'gpt-3.5-turbo',
        temperature: 1.1,
        max_tokens: 300,
      });
      
      return response.choices[0].message.content
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }

async function GetInteractionResponse (context, req)
{
    try {
        // read the body of the req as a stream given this is an azure function
        const fullReq = await req.json();
        const { type, data, token, channel_id, message } = fullReq;
        
        console.log(fullReq);
        
        if (type === InteractionType.PING) {
                return { type: InteractionResponseType.PONG };
        }
        
        const { name } = data;
        if (name === 'test') {
            return { type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, data: { content: 'This is a bot test and it worked I responded' } };
        }

        if (name === 'ask-bob') {
            // Defer the response
            console.log("Asking bob")
            
            context.JSON( {
                type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
            });

            let gptResponse = await getGPTResponse(data.options[0].value);
            
            // Send a PATCH request to the Discord API to edit the original message
            let response = await fetch(`https://discord.com/api/v8/webhooks/${process.env.APP_ID}/${token}/messages/@original`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bot ${process.env.BOBROSSBOTTOKEN}`
                },
                body: JSON.stringify({
                    content: `**you asked bob:** ${data.options[0].value}\n**bob says:** ${gptResponse}`,
                }),
            });

            console.log(response.status);
        }
    } catch (error) {
        console.error(error);
        return {
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                    content: 'An error occurred while processing the interaction.',
                    flags: InteractionResponseFlags.EPHEMERAL,
            },
        };
    }
}

app.http('Test', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const name = request.query.get('name') || await request.text() || 'world';

        return { body: `function return` };
    }
});

app.http("talk-to-bob", {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (req, context) => {
      context.log("Function called");
      let requestBody = await req.json();

      context.log(requestBody);

      var response = {
        message: (await getGPTResponse(requestBody.prompt))
      }
      console.log(response);

      return {
        body: JSON.stringify(response)
      }
    }
})

app.http('Interactions', {
    methods: ['POST', 'GET', 'PATCH', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    authLevel: 'anonymous',
    handler: async (req, context) => {
        context.log("Function called");

        // return the response from the interaction handler
        let response = await GetInteractionResponse(context, req);

        context.log(response);

        return {
          body: JSON.stringify(response)
        };
    }
});
