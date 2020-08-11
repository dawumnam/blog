FROM node:14.7-alpine
WORKDIR /usr/src/blog
COPY package*.json ./
RUN npm i
COPY . .
EXPOSE 5000
CMD ["npm", "run", "devStart"]