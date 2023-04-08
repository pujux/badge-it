FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY src/ ./

EXPOSE 10001

CMD ["node", "index.js"]
