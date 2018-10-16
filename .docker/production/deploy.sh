export REPO=wowanalyzer/wowanalyzer;
export BUILD_TAG="build-$TRAVIS_BUILD_NUMBER";
export DEPLOY_TAG=$(
  if [ "$TRAVIS_BRANCH" == "master" ]; then
    echo "latest";
  else
    echo $TRAVIS_BRANCH;
  fi | sed -r 's/\//-/g'
);

echo "> Create a Docker image for this specific build. This allows us to go back to a particular build at any time, and makes it possible to deploy without rebuilding by just re-tagging the image.";

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin;
docker tag wowanalyzer $REPO:$BUILD_TAG;
docker push $REPO:$BUILD_TAG;
docker tag $REPO:$BUILD_TAG $REPO:$DEPLOY_TAG;
docker push $REPO:$DEPLOY_TAG;
