const MiddlewareHandler = require("azure-middleware");
// import { verifyKey } from "discord-interactions";

// function VerifyDiscordRequest(clientKey) {
//   return function (context, res, buf, encoding) {
//     const signature = context.headers['X-Signature-Ed25519'];
//     const timestamp = context.headers['X-Signature-Timestamp'];
    
//     const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
//     if (!isValidRequest) {
//       return 'Bad request signature';
//     }
//   };
// }

const discordVerifyMiddleware = new MiddlewareHandler()
  .use(context => {
    context.res = {
      status: 401,
      body: 'Bad request signature'
    };
    context.next();
  })
  .listen()
 
module.exports = { discordVerifyMiddleware };