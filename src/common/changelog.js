export function date(year, month, day) {
  // months are 0 indexed in javascript's Date parameters
  const javascriptMonth = month - 1;
  return new Date(year, javascriptMonth, day);
}
export function change(date, text, contributors) {
  if (!(date instanceof Date)) {
    throw new Error('date should be an instance of the Date class');
  }

  return {
    date,
    changes: text,
    contributors: Array.isArray(contributors) ? contributors : [contributors],
  };
}
