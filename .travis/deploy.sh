export REPO=martijnhols/wowanalyzer;
export OLD_TAG="build-$TRAVIS_BUILD_NUMBER";
export NEW_TAG=$(
  if [ "$TRAVIS_BRANCH" == "master" ]; then
    echo "latest";
  else
    echo $TRAVIS_BRANCH;
  fi | sed -r 's/\//-/g'
);

echo "# Docker login";
docker login --username="$DOCKER_USERNAME" --password="$DOCKER_PASSWORD";
echo "# Docker push";
docker push $REPO:$BRANCH;
