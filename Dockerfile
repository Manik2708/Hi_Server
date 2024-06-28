FROM node:18-alpine
RUN apk update && apk add curl
RUN npm install -g @nestjs/cli
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm run build
CMD ["node","dist/main.js"]
EXPOSE 3000