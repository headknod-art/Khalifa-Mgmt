# Use node:18 (full version, not alpine)
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Clean install from lockfile
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose port 3000
EXPOSE 3000

# Command to start the development server
CMD ["npm", "start"]
