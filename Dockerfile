FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install --production
CMD ["ts-node", "index.ts"]
EXPOSE 3000
