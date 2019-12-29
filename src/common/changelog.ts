import React from 'react';

import { Contributor } from 'parser/Config';

export function date(year: number, month: number, day: number) {
  // months are 0 indexed in javascript's Date parameters
  const javascriptMonth = month - 1;
  return new Date(year, javascriptMonth, day);
}
export function change(
  date: Date,
  text: React.ReactNode,
  contributors: Contributor | Contributor[],
) {
  if (!(date instanceof Date)) {
    throw new Error('date should be an instance of the Date class');
  }

  return {
    date,
    changes: text,
    contributors: Array.isArray(contributors) ? contributors : [contributors],
  };
}
