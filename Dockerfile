# Docker file configuration for AdvenTour backend in developer mode

# Using node:20.12.0-alpine as the base image in
FROM node:20.12.0-alpine AS development

# Set /app as the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json .

# Install dependencies
RUN npm install

# Copy the rest of the application files to the working directory
COPY . .

# start the dev server on docker run, nodemon
CMD ["npm", "run", "dev"]


# Docker file configuration for AdvenTour backend in production mode

# Using node:20.12.0-alpine as the base image in production mode
FROM node:20.12.0-alpine AS production 

# Set /app as the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json .

# Install dependencies
RUN npm install

# Copy the rest of the application files to the working directory
COPY . .

# build will transpile the typescript files in /src to /dist
RUN npm run build

# start the server on docker run, node dist/server.js
CMD ["npm", "run", "prod"]









