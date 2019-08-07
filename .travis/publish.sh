echo "> Uploading the Docker image for this specific build. This allows us to go back to a particular build at any time but won't cause an auomated deploy since each build tag is unique.";
docker tag wowanalyzer $DOCKER_REPO:$DOCKER_IMAGE_BUILD_TAG;
docker push $DOCKER_REPO:$DOCKER_IMAGE_BUILD_TAG;
