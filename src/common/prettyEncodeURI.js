export default function prettyEncodeURI(string) {
  return encodeURI(string).replace(/%20/g, '+');
}