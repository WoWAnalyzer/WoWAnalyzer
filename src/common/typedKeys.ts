const typedKeys = <T extends object>(obj: T) => Object.keys(obj) as Array<keyof typeof obj>;

export default typedKeys;
