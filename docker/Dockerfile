# Stage 1: Build the React application
FROM node:20 AS build0

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN yarn install

# Copy the rest of your app's source code
COPY . .

# Build your app
RUN yarn build

FROM node:20 AS build1

WORKDIR /app/proxy
COPY proxy/ .

RUN yarn global add typescript
RUN yarn global add tsc

RUN yarn install
RUN ls -la
RUN tsc src/proxy.ts

# Stage 2: Set up the server
FROM node:20

# Set working directory
WORKDIR /app


# Install only production dependencies
RUN yarn install
RUN yarn global add serve
RUN yarn global add ts-node

# Copy built assets from the build stage
COPY --from=build0 /app/build /app/build
COPY --from=build1 /app/proxy /app/proxy

# Copy server code (assuming your proxy server code is in server.js)
COPY proxy ./

# Expose the port the app runs on
EXPOSE 3000

COPY docker/entrypoint.sh .


# Start the app
CMD [ "entrypoint.sh" ]
