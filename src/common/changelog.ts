import { Contributor } from 'common/contributor';
import * as React from 'react';

export type ChangelogEntry = {
  date: Date;
  changes: React.ReactNode;
  contributors: Contributor[];
};

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
  if (Array.isArray(contributors) && contributors.length === 1) {
    throw new Error(
      'contributor should only be in an array if there are multiple contributors to a change',
    );
  }

  return {
    date,
    changes: text,
    contributors: Array.isArray(contributors) ? contributors : [contributors],
  };
}
