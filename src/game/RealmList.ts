import { REALMS, CLASSIC_REALMS } from './REALMS';

type RealmList = Record<string, Realm[]>;

interface Realm {
  name: string;
  slug: string;
}

export const REALM_LIST: RealmList = REALMS;
export const CLASSIC_REALM_LIST: RealmList = CLASSIC_REALMS;
