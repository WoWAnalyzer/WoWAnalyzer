/**
 * This contains a listing of all contributors. Entries are used in configs and changelogs.
 * Feel free to add yourself if you're not yet in the list.
 *
 * Using `require` for avatars so we don't have to keep a seperate list of imports disconnected from the maintainer definition.
 *
 EXAMPLE

 export const NICKNAME: Contributor = {
    nickname: 'NICKNAME',
    github: 'GITHUB_NAME',
    discord: 'DISCORD_NAME#xxxx',
    avatar: require('./images/IMAGE'),
    about: 'DESCRIPTION',
    mains: [{
      name: 'CHARNAME',
      spec: SPECS.BLOOD_DEATH_KNIGHT,
      link: 'ARMOR/WCL-LINK',
    }],
    alts: [{
      name: 'CHARNAME',
      spec: SPECS.BLOOD_DEATH_KNIGHT,
      link: 'ARMOR/WCL-LINK',
    }],
    others: {
      'Custom Item': 'normal text',
      'Custom Item': [
        'Item 1',
        'Item 2',
      ],
    },
    links: {
      'Link No1': 'https://www.google.com',
    },
  };
*/

import SPECS from 'game/SPECS';
import { Contributor } from 'common/contributor';

// For testing purposes because I am too lazy to work out a solution for testing that does not involve adding regular code
export const Dummy: Contributor = {
  nickname: 'Dummy',
  github: 'DummyHub',
  twitter: '@Dummy',
  avatar: require('./interface/images/avatars/zerotorescue-avatar.jpg'),
};
export const Zerotorescue: Contributor = {
  nickname: 'Zerotorescue',
  github: 'MartijnHols',
  twitter: 'Zerotorescue',
  discord: 'Zerotorescue#0724',
  avatar: require('./interface/images/avatars/zerotorescue-avatar.jpg'),
  about: 'WoWAnalyzer founder, Holy Paladin theorycrafter',
  mains: [{
    name: 'Zerotorescue',
    spec: SPECS.HOLY_PALADIN,
    link: 'https://worldofwarcraft.com/en-gb/character/alakir/zerotorescue',
  }],
  alts: [{
    name: 'Zerotorescue',
    spec: SPECS.BREWMASTER_MONK,
    link: 'https://worldofwarcraft.com/en-gb/character/skullcrusher/zerotorescue',
  }, {
    name: 'Zerotorescue',
    spec: SPECS.DISCIPLINE_PRIEST,
    link: 'https://worldofwarcraft.com/en-gb/character/xavius/zerotorescue',
  }, {
    name: 'Leukenaam',
    spec: SPECS.RESTORATION_SHAMAN,
    link: 'https://worldofwarcraft.com/en-gb/character/alakir/leukenaam',
  }, {
    name: 'Zerotohunt',
    spec: SPECS.MARKSMANSHIP_HUNTER,
    link: 'https://worldofwarcraft.com/en-gb/character/alakir/Zerotohunt',
  }],
};
export const blazyb: Contributor = {
  nickname: 'blazyb',
  github: 'buimichael',
};
export const Qbz: Contributor = {
  nickname: 'Qbz',
  github: 'Qbz23',
};
export const Stui: Contributor = {
  nickname: 'Stui',
  github: 'vpicone',
  twitter: '@vppicone',
  avatar: require('./interface/images/avatars/stui-avatar.jpg'),
  mains: [{
    name: 'Stui',
    spec: SPECS.FIRE_MAGE,
    link: 'https://www.warcraftlogs.com/character/id/45514247',
  }],
};
export const sref: Contributor = {
  nickname: 'sref',
  github: 'kfinch',
  avatar: require('./interface/images/avatars/sref-avatar.jpg'),
};
export const Iskalla: Contributor = {
  nickname: 'Iskalla',
  github: 'Iskalla',
  avatar: require('./interface/images/avatars/iskalla-avatar.jpg'),
};
export const enragednuke: Contributor = {
  nickname: 'enragednuke',
  github: 'enragednuke',
};
export const Skamer: Contributor = {
  nickname: 'Skamer',
  github: 'Skamer',
};
export const Salarissia: Contributor = {
  nickname: 'Salarissia',
  github: 'Salarissia',
};
export const WOPR: Contributor = {
  nickname: 'WOPR',
  github: 'shighman',
};
export const Yajinni: Contributor = {
  nickname: 'Yajinni',
  github: 'yajinni',
};
export const Bonebasher: Contributor = {
  nickname: 'Bonebasher',
  github: 'Bonebasher',
};
export const Sharrq: Contributor = {
  nickname: 'Sharrq',
  github: 'Sharrq',
  discord: 'Sharrq#7530',
  avatar: require('./interface/images/avatars/Sharrq_avatar.jpg'),
  mains: [
    {
      name: 'Sharrq',
      spec: SPECS.FROST_MAGE,
      link: 'https://worldofwarcraft.com/en-us/character/us/bleeding-hollow/sharrq',
    }],
    alts: [{
      name: 'Maniaq',
      spec: SPECS.SHADOW_PRIEST,
      link: 'https://worldofwarcraft.com/en-us/character/us/bleeding-hollow/maniaq',
    }, {
      name: 'Requva',
      spec: SPECS.MISTWEAVER_MONK,
      link: 'https://worldofwarcraft.com/en-us/character/us/bleeding-hollow/requva',
    }, {
      name: 'Fraqture',
      spec: SPECS.PROTECTION_PALADIN,
      link: 'https://worldofwarcraft.com/en-us/character/us/bleeding-hollow/fraqture',
    }],
};
export const Khazak: Contributor = {
  nickname: 'Khazak',
  github: 'jjs451',
  avatar: require('./interface/images/avatars/khazak-avatar.jpg'),
  discord: 'Khazak#3360',
  mains: [{
    name: 'Khazak',
    spec: SPECS.FROST_DEATH_KNIGHT,
    link: 'https://worldofwarcraft.com/en-us/character/us/illidan/khazak',
  }],
};
export const Bicepspump: Contributor = {
  nickname: 'Bicepspump',
  github: 'Bicepspump',
};
export const Mamtooth: Contributor = {
  nickname: 'Mamtooth',
  github: 'ronaldpereira',
  avatar: require('./interface/images/avatars/mamtooth-avatar.png'),
};
export const Thieseract: Contributor = {
  nickname: 'Thieseract',
  github: 'Thieseract',
};
export const Putro: Contributor = {
  nickname: 'Putro',
  github: 'Pewtro',
  discord: 'Putro#6093',
  avatar: require('./interface/images/avatars/putro-avatar.png'),
  mains: [
    {
      name: 'Putro',
      spec: SPECS.MARKSMANSHIP_HUNTER,
      link: 'https://worldofwarcraft.com/en-gb/character/ragnaros/putro',
    },
  ],
};
export const Blazballs: Contributor = {
  nickname: 'Blazballs',
  github: 'leapis',
};
export const faide: Contributor = {
  nickname: 'faide',
  github: 'FaideWW',
  avatar: require('./interface/images/avatars/faide-avatar.png'),
};
export const Fyruna: Contributor = {
  nickname: 'Fyruna',
  github: 'Fyruna',
  avatar: require('./interface/images/avatars/Fyruna_avatar.jpg'),
  mains: [{
    name: 'Aevaa',
    spec: SPECS.ASSASSINATION_ROGUE,
    link: 'https://worldofwarcraft.com/en-gb/character/magtheridon/aevaa',
  }],
  alts: [{
    name: 'Aeri',
    spec: SPECS.BREWMASTER_MONK,
    link: 'https://worldofwarcraft.com/en-gb/character/magtheridon/aeri',
  }, {
    name: 'Avynn',
    spec: SPECS.DISCIPLINE_PRIEST,
    link: 'https://worldofwarcraft.com/en-gb/character/magtheridon/avynn',
  }, {
    name: 'Seiralia',
    spec: SPECS.RESTORATION_DRUID,
    link: 'https://worldofwarcraft.com/en-gb/character/sporeggar/seiralia',
  }],
};
export const Anomoly: Contributor = {
  nickname: 'Anomoly',
  github: 'anom0ly',
  avatar: require('./interface/images/avatars/anomoly-avatar.jpg'),
};
export const Juko8: Contributor = {
  nickname: 'Juko8',
  github: 'Juko8',
  avatar: require('./interface/images/avatars/juko8-avatar.jpg'),
};
export const Noichxd: Contributor = {
  nickname: 'Noichxd',
  github: 'Noichxd',
};
export const Hewhosmites: Contributor = {
  nickname: 'Hewhosmites',
  github: 'CollCrom',
  avatar: require('./interface/images/avatars/hewhosmites-avatar.png'),
};
export const Reglitch: Contributor = {
  nickname: 'Reglitch',
  github: 'rp4rk',
};
export const Gao: Contributor = {
  nickname: 'Gao',
  github: 'awlego',
};
export const Oratio: Contributor = {
  nickname: 'Oratio',
  github: 'karlpralow',
};
export const Ogofo: Contributor = {
  nickname: 'Ogofo',
  github: 'Ogofo',
};
export const hassebewlen: Contributor = {
  nickname: 'hassebewlen',
  github: 'hasseboulen',
};
export const tsabo: Contributor = {
  nickname: 'tsabo',
  github: 'TsaboTavok',
};
export const zealk: Contributor = {
  nickname: 'zealk',
  github: 'zealk',
};
export const fasib: Contributor = {
  nickname: 'fasib',
  github: 'fasib',
};
export const janvavra: Contributor = {
  nickname: 'janvavra',
  github: 'janvavra',
};
export const Nighteyez07: Contributor = {
  nickname: 'Nighteyez07',
  github: 'Nighteyez07',
};
export const Versaya: Contributor = {
  nickname: 'Versaya',
  github: 'versaya',
};
export const Chizu: Contributor = {
  nickname: 'Chizu',
  github: 'sMteX',
  avatar: require('./interface/images/avatars/Chizu_avatar.jpg'),
};
export const Gwelican: Contributor = {
  nickname: 'Gwelican',
  github: 'gwelican',
};
export const Hordehobbs: Contributor = {
  nickname: 'Hordehobbs',
  github: 'hpabst',
};
export const TheBadBossy: Contributor = {
  nickname: 'TheBadBossy',
  github: 'BadBossy',
  avatar: require('./interface/images/avatars/thebadbossy_avatar.jpg'),
};
export const JLassie82: Contributor = {
  nickname: 'JLassie82',
  github: 'JLassie82',
};
export const aryu: Contributor = {
  nickname: 'aryu',
  github: 'Yuyz0112',
};
export const Hartra344: Contributor = {
  nickname: 'Hartra344',
  github: 'Hartra344',
  discord: 'Erlaris#8483',
  mains: [
    {
      name: 'Erlaris',
      spec: SPECS.HOLY_PRIEST,
      link: 'https://worldofwarcraft.com/en-us/character/area-52/Erlaris',
    },
  ],
};
export const strel: Contributor = {
  nickname: 'strel',
  github: 'unknown',
};
export const Maldark: Contributor = {
  nickname: 'Maldark',
  github: 'Maldark',
};
export const hatra344: Contributor = {
  nickname: 'hatra344',
  github: 'hatra344',
};
export const emallson: Contributor = {
  nickname: 'emallson',
  github: 'emallson',
  avatar: require('./interface/images/avatars/emallson-avatar.jpg'),
};
export const Gebuz: Contributor = {
  nickname: 'Gebuz',
  github: 'Gebuz',
  discord: 'Gebuz#5801',
  avatar: require('./interface/images/avatars/gebuz-avatar.jpg'),
  about: 'Balance Druid theorycrafter and top end mythic raider.',
  mains: [{
    name: 'Gebuz',
    spec: SPECS.BALANCE_DRUID,
    link: 'http://eu.battle.net/wow/character/nagrand/Gebuz/',
  }],
  alts: [{
    name: 'Gebuzstab',
    spec: SPECS.SUBTLETY_ROGUE,
    link: 'http://eu.battle.net/wow/character/nagrand/Gebuzstab/',
  }, {
    name: 'Gebuzpray',
    spec: SPECS.DISCIPLINE_PRIEST,
    link: 'http://eu.battle.net/wow/character/nagrand/Gebuzpray/',
  }, {
    name: 'Gebuzgrip',
    spec: SPECS.BLOOD_DEATH_KNIGHT,
    link: 'http://eu.battle.net/wow/character/nagrand/Gebuzgrip/',
  }, {
    name: 'Gebuzroll',
    spec: SPECS.BREWMASTER_MONK,
    link: 'http://eu.battle.net/wow/character/nagrand/Gebuzroll/',
  }],
};
export const milesoldenburg: Contributor = {
  nickname: 'milesoldenburg',
  github: 'milesoldenburg',
};
export const mwwscott0: Contributor = {
  nickname: 'mwwscott0',
  github: 'mwwscott0',
};
export const Talby: Contributor = {
  nickname: 'Talby',
  github: 'Talby223',
};
export const Coryn: Contributor = {
  nickname: 'Coryn',
  github: 'terndrup',
};
export const AttilioLH: Contributor = {
  nickname: 'AttilioLH',
  github: 'AttilioLH',
};
export const poneria: Contributor = {
  nickname: 'poneria',
  github: 'poneria',
};
export const Nekorsis: Contributor = {
  nickname: 'Nekorsis',
  github: 'Nekorsis',
};
export const greatman: Contributor = {
  nickname: 'greatman',
  github: 'greatman',
};
export const rubensayshi: Contributor = {
  nickname: 'rubensayshi',
  github: 'rubensayshi',
};
export const nutspanther: Contributor = {
  nickname: 'nutspanther',
  github: 'nutspanther',
};
export const Riglerr: Contributor = {
  nickname: 'Riglerr',
  github: 'Riglerr',
};
export const BlokyKappa: Contributor = {
  nickname: 'BlokyKappa',
  github: 'BlokyKappa',
};
export const kyleglick: Contributor = {
  nickname: 'kyle-glick',
  github: 'kyle-glick',
};
export const Zeboot: Contributor = {
  nickname: 'Zeboot',
  github: 'Zeboot',
  discord: 'Zeboot#0001',
  avatar: require('./interface/images/avatars/Zeboot-avatar.jpg'),
  mains: [
    {
      name: 'Zebeer',
      spec: SPECS.BREWMASTER_MONK,
      link: 'https://worldofwarcraft.com/en-us/character/us/whisperwind/zebeer',
    }, {
      name: 'Zeaccent',
      spec: SPECS.PROTECTION_PALADIN,
      link: 'https://worldofwarcraft.com/en-us/character/us/whisperwind/Zeaccent',
    }, ],
    alts: [{
      name: 'Zebot',
      spec: SPECS.PROTECTION_WARRIOR,
      link: 'https://worldofwarcraft.com/en-us/character/us/area-52/Zebot',
    }, {
      name: 'Zeboot',
      spec: SPECS.GUARDIAN_DRUID,
      link: 'https://worldofwarcraft.com/en-us/character/us/whisperwind/zeboot',
    }],
};
export const HawkCorrigan: Contributor = {
  nickname: 'HawkCorrigan',
  github: 'HawkCorrigan',
};
export const Vetyst: Contributor = {
  nickname: 'Vetyst',
  github: 'djanse',
  discord: 'vetyst#0001',
  avatar: require('./interface/images/avatars/vetyst-avatar.png'),
  mains: [{
    name: 'Vetyst',
    spec: SPECS.BALANCE_DRUID,
    link: 'https://worldofwarcraft.com/en-gb/character/tarren-mill/vetyst',
  }],
};
export const Anatta336: Contributor = {
  nickname: 'Anatta336',
  github: 'Anatta336',
  discord: 'Anatta#5878',
};
export const Scaleable: Contributor = {
  nickname: 'Scaleable',
  github: 'wkrueger',
  avatar: require('./interface/images/avatars/scaleable-avatar.jpg'),
};
export const Cloake: Contributor = {
  nickname: 'Cloake',
  github: 'adilasif',
  discord: 'Cloake#9930',
  mains: [{
    name: 'Trixx',
    spec: SPECS.ASSASSINATION_ROGUE,
    link: 'https://worldofwarcraft.com/en-us/character/kelthuzad/Trixx',
  }],
};
export const joshinator: Contributor = {
  nickname: 'joshinator',
  github: 'joshinat0r',
  discord: 'joshinator#7267',
  mains: [{
    name: 'Êxtêndêd',
    spec: SPECS.BLOOD_DEATH_KNIGHT,
    link: 'https://worldofwarcraft.com/en-gb/character/eredar/Êxtêndêd',
  }],
};
export const niseko: Contributor = {
  nickname: 'niseko',
  github: 'niseko',
  discord: 'niseko#4130',
  avatar: require('./interface/images/avatars/niseko-avatar.jpg'),
  mains: [{
    name: 'Niseko',
    spec: SPECS.RESTORATION_SHAMAN,
    link: 'https://worldofwarcraft.com/en-gb/character/draenor/niseko',
  },
    {
      name: 'Nisefy',
      spec: SPECS.HOLY_PRIEST,
      link: 'https://worldofwarcraft.com/en-gb/character/draenor/furryweeb',
    }],
  links: {
    'Ancestral Guidance': 'https://ancestralguidance.com/',
  },
};
export const Aelexe: Contributor = {
  nickname: 'Aelexe',
  github: 'Aelexe',
  avatar: require('./interface/images/avatars/Aelexe-avatar.jpg'),
  mains: [{
    name: 'Aelexe',
    spec: SPECS.HOLY_PALADIN,
    link: 'https://worldofwarcraft.com/en-us/character/frostmourne/aelexe',
  }],
};
export const CubeLuke: Contributor = {
  nickname: 'CubeLuke',
  github: 'CubeLuke',
  discord: 'CubeLuke#8595',
  avatar: require('./interface/images/avatars/CubeLuke-avatar.jpg'),
  mains: [{
    name: 'Monachi',
    spec: SPECS.MISTWEAVER_MONK,
    link: 'https://worldofwarcraft.com/en-us/character/bleeding-hollow/monachi',
  }],
};
export const ackwell: Contributor = {
  nickname: 'ackwell',
  github: 'ackwell',
  discord: 'ackwell#3835',
  avatar: require('./interface/images/avatars/ackwell-avatar.jpg'),
};
export const regret: Contributor = {
  nickname: 'regret',
  github: 'remyaraya',
  discord: "regret#8633",
  mains: [{
    name: 'Ratchrat',
    spec: SPECS.HOLY_PALADIN,
    link: 'https://worldofwarcraft.com/en-us/character/thrall/ratchrat',
  }],
};
export const Khadaj: Contributor = {
  nickname: 'Khadaj',
  github: 'tjmoats',
  discord: "Khadaj#3519",
  avatar: require('./interface/images/avatars/khadaj-avatar.jpg'),
  mains: [{
    name: 'Khadaj',
    spec: SPECS.HOLY_PRIEST,
    link: 'https://worldofwarcraft.com/en-us/character/firetree/khadaj',
  }],
};
export const fel1ne: Contributor = {
  nickname: 'fel1ne',
  github: 'fel1n3',
  discord: 'Dr. fel1ne#5614',
  avatar: require('./interface/images/avatars/fel1ne-avatar.png'),
  mains: [{
    name: 'Felerai',
    spec: SPECS.RESTORATION_DRUID,
    link: 'https://www.worldofwarcraft.com/en-us/character/khazgoroth/Felerai',
  }],
};
export const Dambroda: Contributor = {
  nickname: 'Dambroda',
  github: 'Dambroda',
  discord: 'Dambroda#1290',
  avatar: require('./interface/images/avatars/Dambroda-avatar.jpg'),
  mains: [{
    name: 'Dambroma',
    spec: SPECS.FROST_MAGE,
    link: 'https://worldofwarcraft.com/en-us/character/stormrage/dambroma',
  }],
};
export const Nalhan: Contributor = {
  nickname: 'Nalhan',
  github: 'Nalhan',
  discord: 'rye bread#9105',
  mains: [{
    name: 'Doughmaker',
    spec: SPECS.DISCIPLINE_PRIEST,
    link: 'http://us.battle.net/wow/character/arthas/Doughmaker',
  }],
};
export const Satyric: Contributor = {
  nickname: 'Satyric',
  github: 'kujan',
  discord: 'Satyric#9107',
  mains: [{
    name: 'Satyric',
    spec: SPECS.HOLY_PALADIN,
    link: 'https://worldofwarcraft.com/en-gb/character/ragnaros/Satyric',
  }],
};
export const jos3p: Contributor = {
  nickname: 'jos3p',
  github: 'jos3p',
  discord: 'jos3p#9746',
};
export const Matardarix: Contributor = {
  nickname: 'Matardarix',
  github: 'matardarix',
  discord: 'Matardarix#9847',
  avatar: require('./interface/images/avatars/matardarix-avatar.jpg'),
  mains: [{
    name: 'Mâtârdarix',
    spec: SPECS.ARMS_WARRIOR,
    link: 'https://worldofwarcraft.com/en-gb/character/hyjal/M%C3%A2t%C3%A2rdarix',
  }],
};
export const mtblanton: Contributor = {
  nickname: 'mtblanton',
  github: 'mtblanton',
  mains: [{
    name: 'Harzwaz',
    spec: SPECS.ENHANCEMENT_SHAMAN,
    link: 'https://worldofwarcraft.com/en-us/character/turalyon/Harzwaz',
  }],
};
export const Streammz: Contributor = {
  nickname: 'Streammz',
  github: 'Streammz',
  discord: 'Streammz#9999',
};
export const Eylwen: Contributor = {
  nickname: 'Eylwen',
  github: 'Alastair-Scott',
  discord: 'Eylwen#0287',
};
export const Korebian: Contributor = {
  nickname: 'Korebian',
  github: 'Asamsig',
};
export const _4Ply: Contributor = {
  nickname: '4Ply',
  github: '4Ply',
  discord: '4Ply#9270',
  mains: [{
    name: 'Uzdrowiciela',
    spec: SPECS.RESTORATION_DRUID,
    link: 'https://worldofwarcraft.com/en-gb/character/sylvanas/Uzdrowiciela',
  }],
};
export const Dorixius: Contributor = {
  nickname: 'Dorixius',
  github: 'florianschut',
  avatar: require('./interface/images/avatars/dorixius-avatar.jpeg'),
  discord: 'Florian#9270',
  mains: [{
    name:'Dorixius',
    spec: SPECS.UNHOLY_DEATH_KNIGHT,
    link: 'https://worldofwarcraft.com/en-gb/character/steamwheedle-cartel/Dorixius',
  }],
};
export const Skeletor: Contributor = {
  nickname: 'Skeletor',
  github: 'LordSkeletor',
  discord: 'Skeletor#0001',
  avatar: require('./interface/images/avatars/Skeletor_avatar.png'),
  mains: [{
    name: 'Ilivath',
    spec: SPECS.RETRIBUTION_PALADIN,
    link: 'https://worldofwarcraft.com/en-us/character/zuljin/Ilivath',
    }],
  links: {
    'RetPaladin.XYZ': 'https://www.retpaladin.xyz/ret-paladin-8-1-0-pve-guide',
  },
};
export const Abelito75: Contributor = {
  nickname: 'Abelito75',
  github: 'abelito75',
  avatar: require('./interface/images/avatars/Abelito75-avatar.png'),
  about: 'MW Vet in Peak of Serenity discord, MW Theorycrafter',
  mains:[{
    name: 'Magnapinna',
    spec: SPECS.MISTWEAVER_MONK,
    link: 'https://worldofwarcraft.com/en-us/character/us/malganis/Magnapinna',
  }],
  alts: [{
    name: 'Barreleye',
    spec: SPECS.HOLY_PALADIN,
    link: 'https://raider.io/characters/us/malganis/Barreleye',
  }],
};
export const HolySchmidt: Contributor = {
  nickname: 'HolySchmidt',
  github: '5chmidt',
  avatar: require('./interface/images/avatars/holyschmidt-avatar.jpg'),
  about: 'Holy Paladin, Tinkerer',
  mains: [{
    name: 'HolySchmidt',
    spec: SPECS.HOLY_PALADIN,
    link: 'https://worldofwarcraft.com/en-us/character/us/whisperwind/holyschmidt',
  }],
};
export const Coywolf: Contributor = {
  nickname: 'Coywolf',
  github: 'Coywolf',
  discord: 'Coywolf#3500',
  mains: [{
    name: 'Coywolf',
    spec: SPECS.OUTLAW_ROGUE,
    link: 'https://worldofwarcraft.com/en-us/character/us/arthas/coywolf',
  }],
};
export const Scotsoo: Contributor = {
  nickname: 'Scotsoo',
  github: 'Scotsoo',
  discord: 'Scotsoo#5328',
  avatar: require('./interface/images/avatars/Scotsoo-avatar.jpg'),
  mains: [{
    name: 'Scotsoodh',
    spec: SPECS.HAVOC_DEMON_HUNTER,
    link: 'https://worldofwarcraft.com/en-us/character/eu/tarren-mill/scotsoodh',
  }],
};
export const LeoZhekov: Contributor = {
  nickname: 'LeoZhekov',
  github: 'LeoZhekov',
  discord: 'LeoZhekov#6641',
  avatar: require('./interface/images/avatars/LeoZhekov-avatar.jpg'),
  mains: [{
    name: 'Lisossa',
    spec: SPECS.SURVIVAL_HUNTER,
    link: 'https://worldofwarcraft.com/en-gb/character/Ravencrest/Lisossa',
  }],
};
export const Amrux: Contributor = {
  nickname: 'Amrux',
  github: 'grantjoshua1995',
};
export const Viridis: Contributor = {
  nickname: 'Viridis',
  github: 'viridis',
  discord: 'Viridis#2748',
};
export const Wing5wong: Contributor = {
  nickname: 'wing5wong',
  github: 'wing5wong',
  mains: [{
    name: 'Shrom',
    spec: SPECS.BALANCE_DRUID,
    link: 'https://worldofwarcraft.com/en-us/character/us/frostmourne/shrom',
  }],
};
export const Draenal: Contributor = {
  nickname: 'Draenal',
  github: 'MikeCook9994',
  mains: [{
    name: 'Draenal',
    spec: SPECS.ELEMENTAL_SHAMAN,
    link: 'https://worldofwarcraft.com/en-us/character/us/malganis/draenal',
  },
  {
    name: 'MagicEraser',
    spec: SPECS.FROST_MAGE,
    link: 'https://worldofwarcraft.com/en-us/character/us/malganis/magiceraser',
  }],
};
export const Adoraci: Contributor = {
  nickname: 'Adoraci',
  github: 'DylanDirlam',
  discord: 'Adoraci#0001',
  avatar: require('./interface/images/avatars/Adoraci-avatar.jpg'),
  mains: [{
    name: 'Adoraci',
    spec: SPECS.SHADOW_PRIEST,
    link: 'https://worldofwarcraft.com/en-us/character/us/zuljin/adoraci',
  }],
  alts: [{
    name: 'Zenavi',
    spec: SPECS.FURY_WARRIOR,
    link: 'https://worldofwarcraft.com/en-us/character/us/zuljin/zenavi',
  }],
};
export const TheJigglr: Contributor = {
  nickname: 'TheJigglr',
  github: 'myran2',
  discord: 'Henry#4712',
  mains: [{
    name: 'Thejigglr',
    spec: SPECS.ELEMENTAL_SHAMAN,
    link: 'https://worldofwarcraft.com/en-us/character/us/bleeding-hollow/thejigglr',
  }],
};
export const fluffels: Contributor = {
  nickname: 'fluffels',
  github: 'fluffels',
  discord: 'fluffels#4322',
  mains: [{
    name: 'Micheladaw',
    spec: SPECS.AFFLICTION_WARLOCK,
    link: 'https://worldofwarcraft.com/en-gb/character/eu/draenor/micheladaw',
  }],
};
export const JeremyDwayne: Contributor = {
  nickname: 'JeremyDwayne',
  github: 'jeremydwayne',
  discord: 'jeremydwayne#3717',
  mains: [
    {
      name: 'Jeremydwayne',
      spec: SPECS.MISTWEAVER_MONK,
      link: 'https://worldofwarcraft.com/en-us/character/us/stormrage/jeremydwayne',
    },
  ],
  alts: [
    {
      name: 'Jeremypally',
      spec: SPECS.HOLY_PALADIN,
      link: 'https://worldofwarcraft.com/en-us/character/us/stormrage/jeremypally',
    },
    {
      name: 'Morehots',
      spec: SPECS.RESTORATION_DRUID,
      link: 'https://worldofwarcraft.com/en-us/character/us/stormrage/morehots',
    },
    {
      name: 'Dovesoap',
      spec: SPECS.DISCIPLINE_PRIEST,
      link: 'https://worldofwarcraft.com/en-us/character/us/stormrage/dovesoap',
    },
  ],
};
export const Taleria: Contributor = {
  nickname: 'Taleria',
  github: 'bramdevries',
  avatar: require('./interface/images/avatars/taleria-avatar.jpg'),
  mains: [{
    name: 'Taleria',
    spec: SPECS.HOLY_PALADIN,
    link: 'https://worldofwarcraft.com/en-gb/character/eu/eonar/Taleria',
  }],
};
export const axelkic: Contributor = {
  nickname: 'axelkic',
  github: 'axelkic',
};
export const soloxcx: Contributor = {
  nickname: 'soloxcx',
  github: 'soloxcx',
  discord: 'Connor#7037',
  avatar: require('./interface/images/avatars/soloxcx-avatar.jpg'),
  mains: [{
    name: 'Vaerminà',
    spec: SPECS.OUTLAW_ROGUE,
    link: 'https://worldofwarcraft.com/en-us/character/us/thrall/Vaermin%C3%A0',
  }],
};
export const Torothin: Contributor = {
  nickname: 'Brad',
  github: 'Torothin',
  discord: 'Torothin#9751',
};
export const layday: Contributor = {
  nickname: 'layday',
  github: 'layday',
};
export const FraunchToost: Contributor = {
  nickname: 'FraunchToost',
  github: 'FraunchToost',
  discord: 'FraunchToost#1207',
  avatar: require('./interface/images/avatars/FraunchToost-avatar.png'),
  mains: [{
    name: 'Azamia',
    spec: SPECS.MISTWEAVER_MONK,
    link: 'https://worldofwarcraft.com/en-us/character/us/area-52/Azamia',
  }],
};
export const Tiphess: Contributor = {
  nickname: 'Tiphess',
  github: 'Tiphess',
  discord: 'Tiphess#0324',
  avatar: require('./interface/images/avatars/Tiphess-avatar.jpeg'),
  mains: [{
    name: 'Tjphess',
    spec: SPECS.DISCIPLINE_PRIEST,
    link: 'https://worldofwarcraft.com/en-us/character/us/zuljin/tjphess',
  }],
};
export const Tyndi: Contributor = {
  nickname: 'Tyndi',
  github: 'darthelit',
  discord: 'Tyndi#4337',
  avatar: require('./interface/images/avatars/tyndi-avatar.png'),
};
export const MusicMeister: Contributor = {
  nickname: 'MusicMeister',
  github: 'TheMusicMeister',
  discord: 'The Music Meister#8236',
  mains: [{
    name: 'Leviisa',
    spec: SPECS.ENHANCEMENT_SHAMAN,
    link: 'https://worldofwarcraft.com/en-us/character/us/illidan/leviisa',
  }],
};
export const Moonrabbit: Contributor = {
  nickname: 'Moonrabbit',
  github: 'alliepet',
};
export const Vohrr: Contributor = {
  nickname: 'Vohrr',
  github: 'pingypong',
  discord: 'Vohrr#1414',
  about: 'MW Vet in Peak of Serenity discord',
  mains:[{
    name: 'Vohrr',
    spec: SPECS.MISTWEAVER_MONK,
    link: 'https://worldofwarcraft.com/en-us/character/us/bleeding-hollow/vohrr',
  }],
  alts: [{
    name: 'Vokori',
    spec: SPECS.DISCIPLINE_PRIEST,
    link: 'https://worldofwarcraft.com/en-us/character/us/malganis/vokori',
  },
  {
    name: 'Vohrpal',
    spec: SPECS.HOLY_PALADIN,
    link: 'https://worldofwarcraft.com/en-us/character/us/malganis/vohrpal',
  },
  {
    name: 'Zappyvohr',
    spec: SPECS.RESTORATION_SHAMAN,
    link: 'https://worldofwarcraft.com/en-us/character/us/malganis/zappyvohr',
  },
  {
    name: 'Vohrbloom',
    spec: SPECS.RESTORATION_DRUID,
    link: 'https://worldofwarcraft.com/en-us/character/us/malganis/vohrbloom',
  }],
};

export const Vonn: Contributor = {
  nickname: 'Vonn',
  github: 'kenrms',
  discord: 'vønn#2776',
  avatar: require('./interface/images/avatars/vonn-avatar.jpg'),
  mains: [{
    name: 'Vønn',
    spec: SPECS.ENHANCEMENT_SHAMAN,
    link: 'https://worldofwarcraft.com/en-us/character/turalyon/vønn',
  }],
};
export const AdamKelly: Contributor = {
  nickname: 'AdamKelly',
  github: 'Adammkelly',
  discord: 'Overload#0899',
  avatar: require('./interface/images/avatars/karagus-avatar.jpg'),
  mains: [{
    name: 'Karagus',
    spec: SPECS.ELEMENTAL_SHAMAN,
    link: 'https://worldofwarcraft.com/en-gb/character/eu/defias-brotherhood/Karagus',
  }],
};
export const ChristopherKiss: Contributor = {
  nickname: 'Chris',
  github: 'ChristopherKiss',
};
export const ChagriAli: Contributor = {
  nickname: 'chagriali',
  github: 'chagriali',
};
export const Ssabbar: Contributor = {
  nickname: 'ssabbar',
  github: 'ssabbar',
};
export const Barter: Contributor = {
  nickname: 'barter',
  github: 'giubatt'
};
export const Jafowler: Contributor = {
  nickname: 'Jake',
  github: 'jafowler',
  discord: 'Xinnk#3169',
};
export const Guyius: Contributor = {
  nickname: 'Guyius',
  github: 'guyius',
  discord: 'Guyius#1560',
};
export const Amani: Contributor = {
  nickname: 'Amani',
  github: 'AmaniZandalari',
  discord: 'Amani#0001',
  about: 'Russian localizator and leader of Russian Shaman Discord community Vodovorot',
  avatar: require('./interface/images/avatars/amani_avatar.png'),
  mains: [{
      name: 'Аманя',
      spec: SPECS.ELEMENTAL_SHAMAN,
      link: 'https://www.warcraftlogs.com/character/id/42517322',
    }],
};
export const Haelrail: Contributor = {
  nickname: 'Haelrail',
  github: 'Haelrail',
  discord: 'Haelrail#9202',
  about: 'Russian localizator',
};
export const Kruzershtern: Contributor = {
  nickname: 'Kruzershtern',
  github: 'Kruzershtern',
  discord: 'Kruzer#6980',
  about: 'Russian localizator',
};

export const Mae: Contributor = {
  nickname: 'Mae',
  github: 'invfo',
  discord: 'Mae#3348',
  avatar: require('./interface/images/avatars/Mae_avatar.png'),
  mains: [{
    name: 'Maerstrom',
    spec: SPECS.RESTORATION_SHAMAN,
    link: 'https://worldofwarcraft.com/en-gb/character/eu/draenor/maerstrom'
  }]
};

export const Keraldi: Contributor = {
  nickname: 'Keraldi',
  github: 'Keraldi',
  discord: 'Keraldi#0001',
};

export const VMakaev: Contributor = {
  nickname: 'VMakaev',
  github: 'vladimirmakaev',
  discord: 'Vladimir#5076',
  mains: [{
    name: 'Kaylleen',
    spec: SPECS.DISCIPLINE_PRIEST,
    link: 'https://worldofwarcraft.com/en-gb/character/eu/silvermoon/kaylleen'
  }, {
    name: 'Elastan',
    spec: SPECS.PROTECTION_PALADIN,
    link: 'https://worldofwarcraft.com/en-gb/character/eu/silvermoon/elastan'
  }]
};

export const Maleficien: Contributor = {
  nickname: 'Maleficien',
  github: 'kevindqc',
  discord: 'DaRkViRuS#1070',
  mains: [{
    name: 'Maleficien',
    spec: SPECS.AFFLICTION_WARLOCK,
    link: 'https://worldofwarcraft.com/en-us/character/us/zuljin/maleficien'
  }]
};
export const Xcessiv: Contributor = {
  nickname: 'Xcessiv',
  github: 'jwmclark',
  avatar: require('./interface/images/avatars/xcessiv-avatar.jpg'),
  discord: 'Xcessiv#6732',
  mains: [{
    name: 'Xcessiv',
    spec: SPECS.FERAL_DRUID,
    link: 'https://worldofwarcraft.com/en-us/character/us/thrall/xcessiv',
  }],
};

export const Tora: Contributor = {
  nickname: "Tora",
  github: "RobinKa",
  discord: "Tora#1871",
  mains: [{
    name: "Nuhrok",
    spec: SPECS.FERAL_DRUID,
    link: "https://worldofwarcraft.com/en-gb/character/eu/tarren-mill/Nuhrok"
  }],
  links: {
    "Website": "https://warlock.ai"
  },
};
export const Kettlepaw: Contributor = {
  nickname: 'Kettlepaw',
  github: 'abbottmg',
  discord: 'abbott#2506',
  mains: [{
    name: 'Caeldrim',
    spec: SPECS.GUARDIAN_DRUID,
    link: 'https://worldofwarcraft.com/en-us/character/us/wyrmrest-accord/caeldrim',
  }, {
    name: 'Kettlepaw',
    spec: SPECS.BREWMASTER_MONK,
    link: 'https://worldofwarcraft.com/en-us/character/us/wyrmrest-accord/kettlepaw',
  }],
};

export const g3neral: Contributor = {
  nickname: 'g3neral',
  github: 'g3neral-wow',
  discord: 'g3neral#2455',
  mains: [{
    name: 'Nethershift',
    spec: SPECS.FERAL_DRUID,
    link: 'https://worldofwarcraft.com/en-us/character/us/proudmoore/Nethershift',
  }],
};

export const flurreN: Contributor = {
  nickname: 'flurreN',
  github: 'flurreN',
  discord: 'flurreN#6099',
  mains: [{
    name: 'Zyg',
    spec: SPECS.HAVOC_DEMON_HUNTER,
    link: 'https://worldofwarcraft.com/en-gb/character/eu/stormscale/zyg',
  }],
};

export const Carrottopp: Contributor = {
  nickname: "Carrottopp",
  github: "Chasson1992",
  avatar: require('./interface/images/avatars/Carrottopp_avatar.png'),
  discord: "Carrottopp#2592",
  mains: [{
    name: "Carrottopp",
    spec: SPECS.ARMS_WARRIOR,
    link: "https://worldofwarcraft.com/en-us/character/us/stormrage/carrottopp",
  }],
};

export const Vexxra: Contributor = {
  nickname: 'Vexxra',
  github: 'vexxra',
};

export const TurianSniper: Contributor = {
  nickname: 'TurianSniper',
  github: 'tjw87912',
  discord: 'TurianSniper#2941',
  mains: [{
    name: "Nakofel",
    spec: SPECS.VENGEANCE_DEMON_HUNTER,
    link: "https://worldofwarcraft.com/en-us/character/us/bleeding-hollow/nakofel",
  }],
};

export const Geeii: Contributor = {
  nickname: 'Geeii',
  github: 'radean0909',
  discord: 'Geei#8447',
  mains: [{
    name: "Geeii",
    spec: SPECS.VENGEANCE_DEMON_HUNTER,
    link: "https://worldofwarcraft.com/en-us/character/us/area52/geei",
  }],
};

export const Akhtal: Contributor = {
  nickname: 'Akhtal',
  github: 'JoeyBG',
  discord: 'Akhtal#6439',
  mains: [
    {
      name: 'Yllanis',
      spec: SPECS.AFFLICTION_WARLOCK,
      link: 'https://worldofwarcraft.com/en-us/character/us/zuljin/Yllanis',
    },
    {
      name: 'Olwië',
      spec: SPECS.BREWMASTER_MONK,
      link: 'https://worldofwarcraft.com/en-us/character/us/zuljin/Olwi%C3%AB',
    },
  ],
};

export const Barry: Contributor = {
  nickname: 'Barry',
  github: 'bcrabbe',
  discord: 'Barry#5878',
  avatar: require('./interface/images/avatars/barry-avatar.jpg'),
  mains: [
    {
      name: 'Druulux',
      spec: SPECS.RESTORATION_DRUID,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/silvermoon/druulux',
    },
  ],
}

export const Tiboonn: Contributor = {
  nickname: 'Tiboonn',
  github: 'Tiboonn',
};
