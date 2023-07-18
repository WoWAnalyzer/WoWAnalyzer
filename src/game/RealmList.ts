import { REALMS } from './REALMS';

interface RealmList {
  [region: string]: Realm[];
}

interface Realm {
  name: string;
  slug: string;
}

export default REALMS as RealmList;
