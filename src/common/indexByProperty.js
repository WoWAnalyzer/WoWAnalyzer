// A helper function that's more performant than a reduce without being more readable by consumers
export default function indexByProperty(arr, key) {
  const objByKey = {};
  const length = arr.length;
  for (let i = 0; i < length; i++) {
    const item = arr[i];
    objByKey[item[key]] = item;
  }
  return objByKey;
}
