import React from 'react';

import { Spec } from 'game/SPECS';
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
  avatar?: any,
  about?: string,
  mains?: Array<Character>,
  alts?: Array<Character>,
  others?: any,
  links?: { [name: string]: string }
}
export type ChangelogEntry = {
  date: Date,
  changes: React.ReactNode,
  contributors: Array<Contributor>
}
export function date(year: number, month: number, day: number) {
  // months are 0 indexed in javascript's Date parameters
  const javascriptMonth = month - 1;
  return new Date(year, javascriptMonth, day);
}
export function change(
  date: Date,
  text: React.ReactNode,
  contributors: Contributor | Contributor[],
): ChangelogEntry {
  if (!(date instanceof Date)) {
    throw new Error('date should be an instance of the Date class');
  }

  return {
    date,
    changes: text,
    contributors: Array.isArray(contributors) ? contributors : [contributors],
  };
}
