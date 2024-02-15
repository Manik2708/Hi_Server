# Hi

This is a chat app aimed at providing users with the feature of sending confessions anonymously to people they wish to confess to. The app will include the following features:

1) Users can sign up with their email address, and an anonymous ID will be allotted after account creation.
2) No user can access the app without verifying their email address.
3) Returning users can log in using their email and retrieve all chat messages and sent confessions.  4) Users can search for other users and send confessions through their anonymous IDs.
5) If the recipient (referred to as the "crush") is online, the confession will be sent immediately.
6) If the crush is offline, the confession will be queued and temporarily stored.
7) When the crush comes online again, they should be able to retrieve all queued confessions.
8) The crush will have the option to either reject or accept the confessions after reading them.
9) If a confession is rejected, the user will be informed about the rejection.
10) If a confession is accepted, a chat will be initiated, allowing the user and the crush to have an end-to-end conversation.
11) Users have the option to reveal their identity for a confession. Once revealed, a new anonymous ID will be allotted to the user, and the crush will be informed.
12) If a confession is accepted and revealing is done for that confession, the chat will be dissolved, and no further chats will be permitted. This is in line with the app's rule: 
`No two known users can chat; at least one of them must be anonymous.`
13) Revealings should occur only after obtaining the user ID of at least one of the other public platforms (Instagram, Facebook, Twitter, etc.).
14) Users should be able to anonymously invite their crush via other social media platforms such as Instagram, Facebook, WhatsApp, Telegram, Twitter, etc.     

## TechStack

1) NestJs and Typescript: This project was originally formed in NodeJs and Typescript but this framework was giving us many problems like: Poor Architecture and No Dependency Injection. Hence we migrated from NodeJs to NestJs (You can find NodeJs repository in the main branch)
2) Jest: For Unit, End-To-End and Integration Testing. Our strategy of Testing can be found in `Testing.md` file
3) Apache Cassandra: A highly available Distributed Database, exclusively used for Messaging Service
4) RabbitMQ: A Message broker acting between Users and their Crush. Will also be used as a broker for external APIs (like Instagram, Twitter etc.)
5) Redis: Caching purposes and for storing Socket Id's. 