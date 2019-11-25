export default function parseVersionString(string) {
  const [major, minor, patch] = string.split('.');

  return {
    major: Number(major),
    minor: minor === undefined ? 0 : Number(minor),
    patch: patch === undefined ? 0 : Number(patch),
  };
}
