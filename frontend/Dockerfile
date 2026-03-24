# frontend/Dockerfile
FROM node:20

WORKDIR /app

# Install git (needed for cloning if necessary)
RUN apt-get update && apt-get install -y git

# Copy project files into container
COPY . .

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Run Prisma migrations (deploy database schema)
RUN npx prisma migrate deploy

# Build the Next.js app for production
RUN npm run build

# Expose Next.js port
EXPOSE 3000

# Start production server
CMD ["npm", "start"]