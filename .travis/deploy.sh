export REPO=martijnhols/wowanalyzer;
export BRANCH=$(
  if [ "$TRAVIS_BRANCH" == "master" ]; then
    echo "latest";
  else
    echo $TRAVIS_BRANCH;
  fi | sed -r 's/\//-/g'
);
echo "#docker build";
docker build --tag $REPO:$BRANCH --file Dockerfile.package .;
echo "#docker login";
docker login --username="$DOCKER_USERNAME" --password="$DOCKER_PASSWORD";
echo "#docker push";
docker push $REPO:$BRANCH;
