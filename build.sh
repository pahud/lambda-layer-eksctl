#!/bin/bash


TAG='eksctl:latest'

docker build -t $TAG . --build-arg DOCKER_MIRROR=${DOCKER_MIRROR-''}

CONTAINER=$(docker run -d $TAG false)
docker cp ${CONTAINER}:/layer.zip layer.zip
docker cp ${CONTAINER}:/VERSION VERSION

