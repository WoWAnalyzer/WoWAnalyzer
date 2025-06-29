import * as contributors from 'CONTRIBUTORS';
import { Spec } from 'game/SPECS';

export interface Character {
  name: string;
  spec: Spec;
  link: string;
}
export interface Contributor {
  nickname: string;
  github: string;
  discord?: string;
  twitter?: string; // Currently unused
  avatar?: string;
  about?: string;
  mains?: Character[];
  alts?: Character[];
  others?: Record<string, string | string[]>;
  links?: Record<string, string>;
}

const indexContributorsByNickname = (
  accumulator: Record<string, Contributor>,
  contributor: Contributor,
) => {
  if (import.meta.env.DEV) {
    if (accumulator[contributor.nickname]) {
      throw new Error(`A contributor with this nickname already exists: ${contributor.nickname}`);
    }
  }
  return { ...accumulator, [contributor.nickname]: contributor };
};

const contributorsByNickname: Record<string, Contributor> = Object.values(contributors).reduce(
  indexContributorsByNickname,
  {},
);

export default contributorsByNickname;
