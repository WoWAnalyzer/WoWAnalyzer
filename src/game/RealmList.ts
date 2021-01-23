import GENERATED_REALMS from './REALMS';

interface RealmList {
  [region: string]: Realm[]
}

interface Realm {
  "name": string,
  "slug": string,
}

export default GENERATED_REALMS as RealmList;
