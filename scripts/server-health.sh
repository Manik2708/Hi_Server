status=$(docker inspect --format='{{.State.Health.Status}}' hi-container)

if [ "$status" = "healthy" ]; then
    echo "healthy"
else
    echo "unhealthy"
    exit 1
fi