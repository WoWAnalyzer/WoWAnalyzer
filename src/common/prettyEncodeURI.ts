export default function prettyEncodeURI(string: string) {
  return encodeURI(string).replace(/%20/g, '+');
}
