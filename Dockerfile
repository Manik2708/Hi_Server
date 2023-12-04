FROM node:18-alpine
WORKDIR /app
COPY . .
COPY packageDocker.json package.json
RUN npm install --production
CMD ["npm", "start"]
EXPOSE 3000
