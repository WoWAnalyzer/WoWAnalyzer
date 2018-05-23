echo "> Build server";
cd server;
npm run build;
echo "> The server has already been built so we no longer need the devDependencies (reduces the final bundle size)";
npm prune --production;
cd ..;

if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
	echo "> Disabling sourcemap generation to save build time, this is a PR so won't be deployed anyway.";
	export GENERATE_SOURCEMAP=false;
fi

echo "> Build app";
npm run build

if [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
	echo "> Create a Docker image for this specific build. This allows us to go back to a particular build at any time, and makes it possible to deploy without rebuilding by just re-tagging the image.";

	export REPO=martijnhols/wowanalyzer;
	export TAG="build-$TRAVIS_BUILD_NUMBER";
	docker build --tag $REPO:$TAG --file Dockerfile.package .;
	echo "> Push Docker image";
	docker login --username="$DOCKER_USERNAME" --password="$DOCKER_PASSWORD";
	docker push $REPO:$TAG;
fi
