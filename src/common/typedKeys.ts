const typedKeys = <T extends object>(obj: T) => Object.keys(obj) as (keyof typeof obj)[];

export default typedKeys;
