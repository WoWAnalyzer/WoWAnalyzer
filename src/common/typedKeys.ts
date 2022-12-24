const typedKeys = <T>(obj: T) => Object.keys(obj) as Array<keyof typeof obj>;

export default typedKeys;
