# Use Node
FROM node:20-alpine

WORKDIR /app

# Install deps
COPY package.json package-lock.json ./
RUN npm install

# Copy project
COPY . .

# Build app
RUN npm run build

# Start
EXPOSE 3000
CMD ["npm", "start"]