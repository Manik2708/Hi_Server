#!/bin/sh

echo 'Checking Cassandra health'


docker inspect --format='{{.State.Health.Status}}' cassandra-testing


echo 'Checking Redis health'


docker inspect --format='{{.State.Health.Status}}' client-testing


echo 'Checking Rabbit health'


docker inspect --format='{{.State.Health.Status}}' rabbit-testing