FROM node:18-alpine
RUN npm install -g @nestjs/cli
WORKDIR /usr/src/app
COPY . .
RUN sed -i 's/RUNNING_ON_DOCKER=false/RUNNING_ON_DOCKER=true/g' .env
RUN npm install
RUN npm run build
CMD ["node","dist/main.js"]
EXPOSE 3000