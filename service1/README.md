# nodejs-monolithic-architecture-template

docker-compose down  // Stops containers and removes containers, networks, volumes, and images created by up

docker ps // Get the list of the running containers

docker rm {container-id} --force // Remove the container

docker images  // Get the list of all the images

docker rmi {image-id} --force  // Remove the image

env={environment} docker-compose up -d  // start and restart all the services defined in docker-compose.yml env is optional.

docker-compose logs -f  // for see logs 