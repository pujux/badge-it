FROM node:alpine

WORKDIR /opt/git-badges

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]
