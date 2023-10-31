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
3) Now clone the flutter [repo](https://github.com/Manik2708/Hi) and travel to the directory of this clonned repo. Open terminal in the directory and use the following command:
	
	```console
 	npm install
 	``` 

4) Make sure you have installed Android Studio in your machine. We prefer Android Studio over VS Code because it's exclusively for Android Apps but it will not matter if you will code in any other IDE also.
5) Learn typescript from [here](https://www.typescriptlang.org/docs/)
6) Create an account on MongoDB and paste the link in index.ts file in 'Db' variable.
7) Change the IP Address to your IP Address in 'uri' variable present in global_variables file.
8) While connecting to server make sure you Mobile phone and Machine are connected to same Internet.
# What this App meant for users?
This app provides users with the feature to confess anything to a registered user. If the confession is accepted, they can have a chat with that person. Users can create an account or log in if they are already registered. Upon registration, they will receive an anonymous ID, which will be used for sending and receiving messages.

This app allows for sending and receiving messages to both online and offline users. Overall, this app aims to combine the features of **WhatsApp, Instagram, and Telegram**. It offers private chats like WhatsApp, the ability to connect with global users like Instagram, and the capability to retrieve messages without the need for backups, similar to Telegram.

In addition to these features, the app provides Anonymous Chats and Confessions. **The app's unique feature is that at least one of the users remains anonymous, setting it apart from the services mentioned above.**
# Setting Up .env file
After sucessful installation, create a .env file and copy the content of .env.sample file and paste it in .env file. Fill the empty spaces by following the later instructions

**DATABASE_URL**
Create an account on MongoDb and paste the connection string in this variable. The connection string would be of this type: mongodb+srv://<username>:<password>@cluster0.m5ofsm1.mongodb.net/?retryWrites=true&w=majority

**IP_ADDRESS**
Fill it as 0.0.0.0 if you want to run only server but if you want to connect this server to the Flutter Mobile Application then connect your mobile device to same internet as your PC and paste your IP Address in this variable. (For ubuntu users 'ifconfig' is the command to get IP Address)

**NODEMAILER_SENDER_EMAIL**
Type your email address through which you want to send email to verify email address user by the user.

**NODEMAILER_SENDER_PASSWORD**
Go to your google account and search "App Passwords", type an app name and click on create, copy the generated password and paste in this variable by removing all the spaces. Note that your 2-Step verification must be on. Also, this is the procedure when you are using gmail SMTP service, manage yourself with any other SMTP service by reading Nodemailer documentaiions.

**NODEMAILER_SPMTP_SERVICE**
Type 'gmail' or any other SMTP service you are using, be careful here, as these inputs are case-sensitive!

# Workflow of Program
1) When a user creates an account, all their data is saved in a MongoDB database as well as in the local storage of their mobile device. This helps reduce the frequency of API calls. If a user chooses to log in, their details are matched with the data stored in the database, and the retrieval of sent and read confessions takes place. The time required for this retrieval depends on the number of confessions, and it follows an O(N) complexity. At this point, the Socket.io client attempts to connect to the Socket.io server. Upon successful connection, the socket ID is associated with the user ID in the Redis database, and the user is set as online.

2) The search bar also utilizes the Socket.io connection to make it dynamic. Any changes made to the keyboard are emitted as an event to the server, and in response, a list of users is sent for display.

3) Users can send confessions to any registered user. When a confession is made, it is placed in a RabbitMQ queue. Once consumed, the confession is saved in both the MongoDB and Redis databases. The confession is added to the "sentConfessions" array of the sender's document in MongoDB. The same confession is also saved in the Redis database under the receiver's hash.

4) Confessions are also saved in the local storage of the user's mobile device. MongoDB ensures that even if a user uninstalls the app, all their confessions are still saved and can be retrieved during login.

5) Confessions are stored in the Redis database because unread confessions are not saved in the mobile device's local storage. They are only stored locally once they are opened by the user. This is why users may request unread confessions frequently, necessitating caching. Note that confessions are not stored in standard linked lists provided by Redis because deleting a confession from a linked list still resulted in an O(N) complexity. Customized linked lists are used, where the previous and next confession IDs are also saved in the database, reducing the time complexity of deleting a confession to O(1).

6) Requesting received confessions also has an O(1) complexity thanks to the use of pagination both on the server and client sides. Initially, only 30 confessions are sent, and the rest are sent in chunks of 30 confessions when the user requests them. This also reduces the likelihood of large-sized APIs and data loss when a user receives a high number of confessions.

7) Notifications are sent using Firebase Cloud Services if the user is offline.
