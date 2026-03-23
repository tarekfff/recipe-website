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

# Seed admin user automatically
RUN node ./seed-admin.ts

# Expose Next.js port
EXPOSE 3000

# Start dev server
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]