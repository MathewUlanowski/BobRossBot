import FunctionMiddlewareHandler from "azure-middleware";
import { verifyKey } from "discord-interactions";
import 'dotenv/config';

function VerifyDiscordRequest(clientKey) {
  return function (context, res, buf, encoding) {
    const signature = context.headers['X-Signature-Ed25519'];
    const timestamp = context.headers['X-Signature-Timestamp'];
    
    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      return 'Bad request signature';
    }
  };
}

const verifyMiddleware = new FunctionMiddlewareHandler()
  .use(ctx => VerifyDiscordRequest(process.env.PUBLIC_KEY))
  .listen()
 
module.exports = verifyMiddleware;