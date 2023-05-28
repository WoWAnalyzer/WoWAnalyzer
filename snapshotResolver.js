// https://github.com/facebook/jest/issues/1650#issuecomment-475912058
// https://jestjs.io/docs/en/configuration.html#snapshotresolver-string
module.exports = {
  testPathForConsistencyCheck: 'some/example.test.js',

  // Move snapshots next to test file.
  // We still use the .snap extension to help IDEs not index this by default.
  resolveSnapshotPath: (testPath, snapshotExtension) =>
    testPath.replace(/\.test\.([tj]sx?)/, `.test.$1${snapshotExtension}`),

  resolveTestPath: (snapshotFilePath, snapshotExtension) =>
    snapshotFilePath.replace(snapshotExtension, ''),
};
