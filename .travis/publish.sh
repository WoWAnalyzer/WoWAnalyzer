export REPO=wowanalyzer/wowanalyzer;
export BUILD_TAG="build-$TRAVIS_BUILD_NUMBER";
export DEPLOY_TAG=$(
  if [ "$TRAVIS_BRANCH" == "master" ]; then
    echo "latest";
  else
    echo $TRAVIS_BRANCH;
  fi | sed -r 's/\//-/g'
);

echo "> Uploading the Docker image for this specific build. This allows us to go back to a particular build at any time but won't cause an auomated deploy since each build tag is unique.";
docker tag wowanalyzer $REPO:$BUILD_TAG;
docker push $REPO:$BUILD_TAG;
