import 'dotenv/config';
import { capitalize, InstallGlobalCommands } from './utils.js';

// gpt command options
const ASK_BOB_COMMAND = {
  name: 'ask-bob',
  description: 'what would you like to ask bob',
  options: [
    {
      type: 3,
      name: 'prompt',
      description: 'Enter the prompt you would like to ask bob bot',
      required: true,
    },
  ],
  type: 1,
};
const TEST_COMMAND = {
  name: 'test',
  description: 'TEST REQUEST',
  type: 1,
};

const ALL_COMMANDS = [
  ASK_BOB_COMMAND,
];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);