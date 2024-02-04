FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install --production
RUN apk update && apk add lsof
CMD ["npm", "start"]
EXPOSE 3000
