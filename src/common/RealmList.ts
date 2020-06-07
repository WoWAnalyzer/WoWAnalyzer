interface RealmList {
  [region: string]: Array<Realm>
}
interface Realm {
  "name": string,
  "slug": string,
}
export default RealmList;
