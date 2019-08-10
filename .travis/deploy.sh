export DEPLOY_TAG=$(
  if [ "$TRAVIS_BRANCH" == "master" ]; then
    echo "latest";
  else
    echo $TRAVIS_BRANCH;
  fi | sed -r 's/\//-/g'
);

echo "> Tagging the build tag as the latest of its branch.";
# Travis doesn't allow sharing build artifacts between build steps, so we need to fetch a new copy.
docker pull $DOCKER_REPO:$DOCKER_IMAGE_BUILD_TAG;
docker tag $DOCKER_REPO:$DOCKER_IMAGE_BUILD_TAG $DOCKER_REPO:$DEPLOY_TAG;
docker push $DOCKER_REPO:$DEPLOY_TAG;
