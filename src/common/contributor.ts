import { Spec } from 'game/SPECS';
import * as contributors from 'CONTRIBUTORS';

export type Character = {
  name: string,
  spec: Spec,
  link: string,
}
export type Contributor = {
  nickname: string,
  github: string,
  discord?: string,
  twitter?: string, // Currently unused
  avatar?: string,
  about?: string,
  mains?: Character[],
  alts?: Character[],
  others?: { [name: string]: string | string[] },
  links?: { [name: string]: string }
}

export default Object.assign({}, contributors) as Record<string, Contributor>;
