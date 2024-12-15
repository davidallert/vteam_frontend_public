FROM node:18


WORKDIR /kund-app


COPY package*.json ./


RUN npm install

COPY . .


EXPOSE 3000


ENTRYPOINT ["npm", "start"]
