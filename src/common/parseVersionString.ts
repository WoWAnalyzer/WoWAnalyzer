interface Version {
  major: Number
  minor: Number
  patch: Number
}

export default function parseVersionString(version: string): Version {
  const [major, minor, patch] = version.split('.');

  return {
    major: Number(major),
    minor: minor === undefined ? 0 : Number(minor),
    patch: patch === undefined ? 0 : Number(patch),
  };
}
