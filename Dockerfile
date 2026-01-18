# Use the official Node.js 18 image as the base image
FROM node:18

# Build-time arg: install dev dependencies when running test builds
ARG INSTALL_DEV=false

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (respect INSTALL_DEV)
RUN if [ "$INSTALL_DEV" = "true" ] ; then npm ci ; else npm install --production ; fi

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port the bot will use (optional, for documentation purposes)
EXPOSE 3000

# Command to run the bot
CMD ["npm", "start"]