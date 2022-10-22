import type { BaseTranslation } from '../i18n-types';

const en: BaseTranslation = {
  demonhunter: {
    havoc: {
      wastedFury: {
        statistic: {
          tooltip: '{amount:string}% wasted',
          subtitle: 'Fury Wasted',
        },
        suggestion: {
          base: 'You wasted {amount:string} Fury.',
          actual: '{amount:string}% Fury wasted',
          recommend: '<{amount:string}% is recommended',
        },
      },
    },
  },
};

export default en;
