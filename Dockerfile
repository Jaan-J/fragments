#Docker file setup for the fragments container
FROM node:16.15.1-bullseye-slim
ENV NODE_ENV production

LABEL maintainer="Jaan Javed <jjaved3@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

WORKDIR /app

COPY package*.json /app/

RUN npm ci --only=production

# Copy src/
COPY ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

USER node

# Run the server
CMD ["npm", "start"]

# We run our service on port 8080
EXPOSE 8080