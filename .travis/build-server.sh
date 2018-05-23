cd server;
npm run build;
echo "The server has already been built so we no longer need the devDependencies (reduces the final bundle size)";
npm prune --production;
cd ..;
