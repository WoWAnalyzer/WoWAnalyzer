echo "# Build server";
cd server;
npm run build;
echo "The server has already been built so we no longer need the devDependencies (reduces the final bundle size)";
npm prune --production;
cd ..;

echo "# Build app";
npm run build

echo "# Build Docker image";
export REPO=martijnhols/wowanalyzer;
export TAG="build-$TRAVIS_BUILD_NUMBER"
#export BRANCH=$(
#	if [ "$TRAVIS_BRANCH" == "master" ]; then
#		echo "latest";
#	else
#		echo $TRAVIS_BRANCH;
#	fi | sed -r 's/\//-/g'
#);
docker build --tag $REPO:$TAG --file Dockerfile.package .;
echo "# Push Docker image";
docker login --username="$DOCKER_USERNAME" --password="$DOCKER_PASSWORD";
docker push $REPO:$TAG;
