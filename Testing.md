# END-TO-END TESTS
Rather than doing unit and integration tests, we focus more on e2e tests. The reason is fairly simple, now we don't need frontend to test the code. But this leads to many more issues:
1) Setting up seperate testing instances of every service on the machine.
2) As most of tests will be contacting the instances of services, tests might become slower.

Most of the services which we use (like Mongo, Redis and Cassandra) allows us to setup more than one instance on the same machine, but problem comes in RabbitMQ. Also setting up more than one instance on a single machine can be time taking and lead to frusturation. Hence we use Docker-Compose for setting up testing instances of the services we use. Follow the following commands to run tests:
1) Navigate to the `test` directory and run `docker compose up` (Make sure that Docker and Docker Compose are installed on your machine), wait for containers to setup properly. 
2) Now run `npm run test:e2e` for running all the e2e tests and `npm run test` for unit and integration tests. 

# Why Docker-Compose is not injected in npm scripts?
1) We have to wait for sometime after running `docker compose` and it may fail on different machines, as some machines might take more time to setup the containers.
2) Ultimately it will lead to more complexity, the main aim of injecting `docker compose` in npm scripts was to ease the job of contributor, as he should not run docker again and again. We tried but it was becoming more buggy and complex, reasons were:
a) We have to make different scripts for running all the tests and individual tests.
b) Most of the times, a contributor would not be working on all of the tests and if `docker compose` is there in npm scripts it would make a single test much slower, where a single test usually takes 5-7 seconds, a test with docker would take 40-60 seconds as it needs to setup all the containers before the test and kill them after it. This is very uneffecient also, as running and closing compose for each test would lead to higher load on the machine.

# What if you don't want to use Docker?
You might have some problem with docker, or you might be more comfortable with setting up testing instances on your machine. For this move to `.env` file and use the following:
```
        REDIS_TESTING_PORT: The port on which you are running server for testing purpose
        CASSANDRA_TESTING_LINK: The connection string for testing instance of Cassandra
        RABBITMQ_TESTING_LINK: The connection string for testing instance of RabbitMQ 
        MONGO_TESTING_LINK: The connection string for testing instance of MongoDB
``` 
If any of these is kept null, docker compose connection method will be used automatically. 
