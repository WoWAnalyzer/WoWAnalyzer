export REPO=wowanalyzer/wowanalyzer;
export BUILD_TAG="build-$TRAVIS_BUILD_NUMBER";
export DEPLOY_TAG=$(
  if [ "$TRAVIS_BRANCH" == "master" ]; then
    echo "latest";
  else
    echo $TRAVIS_BRANCH;
  fi | sed -r 's/\//-/g'
);

echo "> Tagging the build tag as the latest of its branch.";
# Travis doesn't allow sharing build artifacts between build steps, so we need to fetch a new copy.
docker pull $REPO:$BUILD_TAG;
docker tag $REPO:$BUILD_TAG $REPO:$DEPLOY_TAG;
docker push $REPO:$DEPLOY_TAG;
