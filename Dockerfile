# Use the official Node.js 18 image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port the bot will use (optional, for documentation purposes)
EXPOSE 3000

# Command to run the bot
CMD ["npm", "start"]