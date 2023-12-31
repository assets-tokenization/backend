        
# dev
FROM node:16.10.0-alpine AS dev
RUN apk add --no-cache tzdata
ENV TZ Europe/Kyiv
ENV NODE_PATH /opt/server/node_modules

WORKDIR /opt/server/

CMD [ "sh", "-c", "npm run start" ]

# production
FROM node:16.10.0-alpine AS production
RUN apk add --no-cache tzdata
ENV TZ Europe/Kyiv
ENV NODE_PATH /opt/server/node_modules

WORKDIR /opt/server/

COPY /*.json ./
RUN npm i

CMD ["sh", "-c", "npm run start"]
