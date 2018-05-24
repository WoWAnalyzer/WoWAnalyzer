export REPO=martijnhols/wowanalyzer;
export BUILD_TAG="build-$TRAVIS_BUILD_NUMBER";
export DEPLOY_TAG=$(
  if [ "$TRAVIS_BRANCH" == "master" ]; then
    echo "latest";
  else
    echo $TRAVIS_BRANCH;
  fi | sed -r 's/\//-/g'
);

echo "> Create a Docker image for this specific build. This allows us to go back to a particular build at any time, and makes it possible to deploy without rebuilding by just re-tagging the image.";

export REPO=martijnhols/wowanalyzer;
docker build --tag $REPO:$BUILD_TAG --file Dockerfile.package .;
echo "> Push Docker image";
docker login --username="$DOCKER_USERNAME" --password="$DOCKER_PASSWORD";
docker push $REPO:$BUILD_TAG;
docker tag $REPO:$BUILD_TAG $REPO:$DEPLOY_TAG;
docker push $REPO:$DEPLOY_TAG;
