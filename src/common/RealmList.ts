import GENERATED_REALMS from 'common/REALMS';

interface RealmList {
  [region: string]: Array<Realm>
}

interface Realm {
  "name": string,
  "slug": string,
}

export default GENERATED_REALMS as RealmList;
