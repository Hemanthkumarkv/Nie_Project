# Use Node.js 20 as the base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the default Vite port
EXPOSE 5173

# Start the Vite development server on all network interfaces
CMD ["npm", "run", "dev", "--", "--host"]
