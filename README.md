# Overview of project
This is a bit humrous but an important project which solves the problem of a person not being able to confess his/her feelings for a specific person in the fear of their reaction. This app allows an user to confess any message to any user and if another user accept the confession, then a Chat would be created.   
Required skills are:
1) Flutter
2) Javascript, Node and Typescript
3) Mongo-DB
4) Redis
5) RabbitMQ
6) Firebase Cloud Services

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
	tsc --init
 	``` 

4) Make sure you have installed Android Studio in your machine. We prefer Android Studio over VS Code because it's exclusively for Android Apps but it will not matter if you will code in any other IDE also.
5) Learn typescript from [here](https://www.typescriptlang.org/docs/)
6) Create an account on MongoDB and paste the link in index.ts file in 'Db' variable.
7) Change the IP Address to your IP Address in 'uri' variable present in global_variables file.
8) While connecting to server make sure you Mobile phone and Machine are connected to same Internet.
# Workflow of Program
1) User creates account, all the data is saved in **MongoDb** database and in local storage of Mobile (so as not to call APIs very frequently. If user choose login then the user details are matched with the data stored in database and then retrieving of Sent and Read Confessions take place which requires time according to the amount of confessions. This retrieving of Confessions follow O(N) complexity. At this point **Socket.io** Client tries to connect with Socket.io server, when connected successfully socket id is saved corresponding to user id in **redis** database and user is set online.
2) The search bar again uses Socket.io connection so as to make it dynamic, any change made to keyboard is emitted as an event to the server, in response a list of Users is sent so as to display them.
3) The user can use the Send Confession to any of the registered user. Whenever a confession is made, confession is pushed in a **RabbitMQ** queue, on being consumed, the confession is saved in MongoDb and Redis database. Confession is pushed in the array of 'sentConfessions' of sender document of MongoDb, this same confession is saved in Redis Database of Recievers Hash.
4) Confession is saved in Mobile's local storage also but MongoDb ensures that if user uninstall the app, still 
every confession is saved and hence retrieved suring login.
5) Confession getting saved in Redis Database is because Unread Confessions are not saved in Mobile's local storage, they are only stored in local storage only when they are opened by User, therefore user may request the Unread Confessions very frequently leading to the need of Caching. Note that Confessions are **not** saved in **Standard Linked Lists** given by Redis because deleting a Confession from a linked list was still giving **O(N)** complexity, hence Linked Lists are **customized** by saving previous and next confession id in database also which reduces the time complexity of deleting of confession to **O(1)**.
6) Requesting Recieved Confessions is also a O(1) complexity which is caused by using **Pagination** both in Server and Client Side. Only 30 confessions are sent initially, rest of the confessions are sent only if user demands for it, that too in chunk of 30 confessions. This also reduces the probability of **large sized APIs** and probability of data getting lost if a user recieves very high number of confessions.
7) Notifications are also sent **Firebase Cloud Services** if the user is offline.
