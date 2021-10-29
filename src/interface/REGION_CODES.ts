//used to get the correct region from the language-code
const REGION_CODES: {
  [languageCode: string]: string;
} = {
  'de-de': 'EU',
  'en-gb': 'EU',
  'es-es': 'EU',
  'pt-pt': 'EU',
  'ru-ru': 'EU',
  'fr-fr': 'EU',
  'it-it': 'EU',
  'es-mx': 'US',
  'pt-br': 'US',
  'en-us': 'US',
  'ko-kr': 'KR',
  'zh-tw': 'TW',
  'zh-cn': 'CN',
};

export default REGION_CODES;
