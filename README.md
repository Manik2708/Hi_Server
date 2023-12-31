# Overview of project
This is a bit humrous but an important project which solves the problem of a person not being able to confess his/her feelings for a specific person in the fear of their reaction. This app allows an user to confess any message to any user and if another user accept the confession, then a Chat would be created.   
Required skills are:
1) Flutter
2) Javascript, Node and Typescript
3) Mongo-DB
4) Redis
5) RabbitMQ
6) Socket.io
7) Firebase Cloud Services

# Overview of This Repository
This repository is all about the Rest APIs and Websocket Connections. All the responses are handled in Json. 

# Setting up this project locally
1) Download and install flutter from [here](https://docs.flutter.dev/get-started/install)
2) Download Node js from [here](https://nodejs.org/en/download) and install it by following the installation guide.
3) Install Redis from [here](https://redis.io/docs/getting-started/installation/).
4) Install RabbitMQ server from [here](https://www.rabbitmq.com/download.html)
3) Now clone the flutter [repo](https://github.com/Manik2708/Hi)
4) Navigate to the main directory of this repository and run this command
	
	```console
 	npm install
 	``` 

5) Make sure you have installed Android Studio in your machine. We prefer Android Studio over VS Code because it's exclusively for Android Apps but it will not matter if you will code in any other IDE also.
6) Learn typescript from [here](https://www.typescriptlang.org/docs/)
7) Follow the rest of the ReadMe file and come back to this point, start the server by using this command in the root directiory:
   	```console
 	ts-node index.ts
 	``` 
   
# What this App meant for users?
This app provides users with the feature to confess anything to a registered user. If the confession is accepted, they can have a chat with that person. Users can create an account or log in if they are already registered. Upon registration, they will receive an anonymous ID, which will be used for sending and receiving messages.

This app allows for sending and receiving messages to both online and offline users. Overall, this app aims to combine the features of **WhatsApp, Instagram, and Telegram**. It offers private chats like WhatsApp, the ability to connect with global users like Instagram, and the capability to retrieve messages without the need for backups, similar to Telegram.

In addition to these features, the app provides Anonymous Chats and Confessions. **The app's unique feature is that at least one of the users remains anonymous, setting it apart from the services mentioned above.**
# Setting Up .env file
After sucessful installation, create a .env file and copy the content of .env.sample file and paste it in .env file. Fill the empty spaces by following the later instructions

**DATABASE_URL**: 
Create an account on MongoDb and paste the connection string in this variable. The connection string would be of this type: mongodb+srv://<username>:<password>@cluster0.m5ofsm1.mongodb.net/?retryWrites=true&w=majority.

**IP_ADDRESS**: 
Fill it as 0.0.0.0 if you want to run only server but if you want to connect this server to the Flutter Mobile Application then connect your mobile device to same internet as your PC and paste your IP Address in this variable. (For ubuntu users 'ifconfig' is the command to get IP Address).

**NODEMAILER_SENDER_EMAIL**:  
Type your email address through which you want to send email to verify email address user by the user.

**NODEMAILER_SENDER_PASSWORD**:
Go to your google account and search "App Passwords", type an app name and click on create, copy the generated password and paste in this variable by removing all the spaces. Note that your 2-Step verification must be on. Also, this is the procedure when you are using gmail SMTP service, manage yourself with any other SMTP service by reading Nodemailer documentaiions.

**NODEMAILER_SPMTP_SERVICE**:
Type 'gmail' or any other SMTP service you are using, be careful here, as these inputs are case-sensitive!

# Workflow of Program
The workflow of the program can be found at this [link](https://www.canva.com/design/DAF3HdC-U_M/TfMR5uWcUgN2vfQYUb_-cA/edit?utm_content=DAF3HdC-U_M&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton), the png file is here [file](code-flow.png)
