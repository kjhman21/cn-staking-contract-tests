#!/bin/bash

docker pull klaytn/klaytn:latest
docker-compose -f docker-compose-2cn.yml up 1> docker.stdout 2> docker.stderr &

echo "Waiting until docker is setting up..."
sleep 5

node presetup.js

echo "Removing docker resource..."
docker-compose down
