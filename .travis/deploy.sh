export REPO=martijnhols/wowanalyzer;
export OLD_TAG="build-$TRAVIS_BUILD_NUMBER";
export NEW_TAG=$(
  if [ "$TRAVIS_BRANCH" == "master" ]; then
    echo "latest";
  else
    echo $TRAVIS_BRANCH;
  fi | sed -r 's/\//-/g'
);

docker login --username="$DOCKER_USERNAME" --password="$DOCKER_PASSWORD";
docker pull $REPO:$OLD_TAG;
docker tag $REPO:$OLD_TAG $REPO:$NEW_TAG;
docker push $REPO:$NEW_TAG;
