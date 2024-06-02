cd ..

touch mongo_username

touch mongo_password

grep -i "DATABASE_PASSWORD" .env | tee >> mongo_password

grep -i "DATABASE_USERNAME" .env | tee >> mongo_username

docker secret create mongo_username mongo_username

docker secret create mongo_password mongo_password