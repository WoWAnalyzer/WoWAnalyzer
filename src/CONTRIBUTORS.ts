import { Contributor } from 'common/contributor';
import SPECS from 'game/SPECS';

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
const avatars = import.meta.glob(
  [
    './interface/images/avatars/*.png',
    './interface/images/avatars/*.jpg',
    './interface/images/avatars/*.jpeg',
  ],
  { eager: true },
);

function avatar(filename: string): string {
  const avatar = avatars[`./interface/images/avatars/${filename}`];

  // this branch makes it work both in tests and in the browser
  if (typeof avatar === 'string') {
    return avatar;
  } else if (
    avatar &&
    typeof avatar === 'object' &&
    'default' in avatar &&
    typeof avatar.default === 'string'
  ) {
    return avatar.default;
  } else {
    throw new Error(`./interface/images/avatars/${filename} is an unsupported file type`);
  }
}

// For testing purposes because I am too lazy to work out a solution for testing that does not involve adding regular code
export const Dummy: Contributor = {
  nickname: 'Dummy',
  github: 'DummyHub',
  twitter: '@Dummy',
  avatar: avatar('zerotorescue-avatar.jpg'),
};
export const Zerotorescue: Contributor = {
  nickname: 'Zerotorescue',
  github: 'MartijnHols',
  discord: 'Zerotorescue#0724',
  avatar: avatar('zerotorescue-avatar.jpg'),
  about: 'WoWAnalyzer founder',
};
export const Amryu: Contributor = {
  nickname: 'Amryu',
  github: 'Amryu',
  discord: '@amryu',
  mains: [
    {
      name: 'Amryu',
      spec: SPECS.FURY_WARRIOR,
      link: 'https://classic.warcraftlogs.com/character/eu/everlook/amryu',
    },
  ],
};

export const Fashathus: Contributor = {
  nickname: 'Fashathus',
  github: 'SethEArnold',
  discord: 'Fashathus#7292',
  mains: [
    {
      name: 'Fashathus',
      spec: SPECS.RETRIBUTION_PALADIN,
      link: 'https://www.warcraftlogs.com/character/us/thrall/fashathus',
    },
  ],
};
export const Bigsxy: Contributor = {
  nickname: 'Bigsxy',
  github: 'juemrami',
  discord: 'bigsexy#2241',
  mains: [
    {
      name: 'Bigsexsee',
      spec: SPECS.ASSASSINATION_ROGUE,
      link: 'https://worldofwarcraft.blizzard.com/en-us/character/us/illidan/bigsexsee',
    },
  ],
};
export const ab: Contributor = {
  nickname: 'ab',
  github: 'alex-bau',
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
  avatar: avatar('stui-avatar.jpg'),
  mains: [
    {
      name: 'Stui',
      spec: SPECS.FIRE_MAGE,
      link: 'https://www.warcraftlogs.com/character/id/45514247',
    },
  ],
};
export const Sref: Contributor = {
  nickname: 'Sref',
  github: 'kfinch',
  discord: 'Sref#1337',
  avatar: avatar('sref-avatar.jpg'),
};
export const Iskalla: Contributor = {
  nickname: 'Iskalla',
  github: 'Iskalla',
  avatar: avatar('iskalla-avatar.jpg'),
};
export const enragednuke: Contributor = {
  nickname: 'enragednuke',
  github: 'enragednuke',
};
export const Skamer: Contributor = {
  nickname: 'Skamer',
  github: 'Skamer',
};
export const Soulhealer95: Contributor = {
  nickname: 'Soulhealer',
  github: 'Soulhealer95',
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
export const bhawkins6177: Contributor = {
  nickname: 'bhawkins6177',
  github: 'bhawkins6177',
};
export const Sharrq: Contributor = {
  nickname: 'Sharrq',
  github: 'Sharrq',
  avatar: avatar('Sharrq_avatar.jpg'),
  mains: [
    {
      name: 'Sharrq',
      spec: SPECS.FROST_MAGE,
      link: 'https://worldofwarcraft.com/en-us/character/us/bleeding-hollow/sharrq',
    },
  ],
  alts: [
    {
      name: 'Fraqture',
      spec: SPECS.PROTECTION_PALADIN,
      link: 'https://worldofwarcraft.com/en-us/character/us/bleeding-hollow/fraqture',
    },
    {
      name: 'Sparrq',
      spec: SPECS.ELEMENTAL_SHAMAN,
      link: 'https://worldofwarcraft.com/en-us/character/us/bleeding-hollow/sparrq',
    },
  ],
};
export const Khazak: Contributor = {
  nickname: 'Khazak',
  github: 'jjs451',
  avatar: avatar('khazak-avatar.jpg'),
  discord: 'Khazak#3360',
  mains: [
    {
      name: 'Khazak',
      spec: SPECS.FROST_DEATH_KNIGHT,
      link: 'https://worldofwarcraft.com/en-us/character/us/illidan/khazak',
    },
  ],
};
export const Boohbah: Contributor = {
  nickname: 'Boohbah',
  github: 'robertdiasio',
  avatar: avatar('Boohbah-avatar.png'),
  discord: 'booohbah',
  mains: [
    {
      name: 'Alaryion',
      spec: SPECS.FROST_DEATH_KNIGHT,
      link: 'https://worldofwarcraft.blizzard.com/en-us/character/us/stormrage/Alaryion',
    },
  ],
};
export const Bicepspump: Contributor = {
  nickname: 'Bicepspump',
  github: 'Bicepspump',
  discord: '💪Bicepspump💪#6318',
  mains: [
    {
      name: 'Bicepspump',
      spec: SPECS.UNHOLY_DEATH_KNIGHT,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/kazzak/Bicepspump',
    },
  ],
};
export const Mamtooth: Contributor = {
  nickname: 'Mamtooth',
  github: 'ronaldpereira',
  avatar: avatar('mamtooth-avatar.png'),
};
export const Thieseract: Contributor = {
  nickname: 'Thieseract',
  github: 'Thieseract',
};
export const Putro: Contributor = {
  nickname: 'Putro',
  github: 'Pewtro',
  discord: 'Putro#6093',
  avatar: avatar('putro-avatar.png'),
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
  avatar: avatar('faide-avatar.png'),
};
export const Arlie: Contributor = {
  nickname: 'arlie',
  github: 'avilene',
  avatar: avatar('arlie-avatar.jpg'),
  mains: [
    {
      name: 'Aveline',
      spec: SPECS.RESTORATION_DRUID,
      link: 'https://worldofwarcraft.com/en-gb/character/stormreaver/Aveline',
    },
  ],
};
export const Anomoly: Contributor = {
  nickname: 'Anomoly',
  github: 'anom0ly',
  twitter: 'Anom_MW',
  discord: 'Anomoly#0110',
  avatar: avatar('anomoly-avatar.jpg'),
  mains: [
    {
      name: 'Anom',
      spec: SPECS.MISTWEAVER_MONK,
      link: 'https://worldofwarcraft.com/en-us/character/us/malganis/anom',
    },
  ],
};
export const Juko8: Contributor = {
  nickname: 'Juko8',
  github: 'Juko8',
  avatar: avatar('juko8-avatar.jpg'),
};
export const Noichxd: Contributor = {
  nickname: 'Noichxd',
  github: 'Noichxd',
};
export const Hewhosmites: Contributor = {
  nickname: 'Hewhosmites',
  github: 'CollCrom',
  avatar: avatar('hewhosmites-avatar.png'),
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
  avatar: avatar('Chizu_avatar.jpg'),
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
  avatar: avatar('thebadbossy_avatar.jpg'),
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
  nickname: 'Mokaba',
  github: 'Hartra344',
  discord: 'Mokaba#0001',
  mains: [
    {
      name: 'Mokaba',
      spec: SPECS.BALANCE_DRUID,
      link: 'https://worldofwarcraft.com/en-us/character/thrall/mokaba',
    },
  ],
};
export const ap2355: Contributor = {
  nickname: 'Aulzahr',
  github: 'ap2355',
};
export const strel: Contributor = {
  nickname: 'strel',
  github: 'unknown',
};
export const Maldark: Contributor = {
  nickname: 'Maldark',
  github: 'Maldark',
  discord: 'Maldark#1478',
  mains: [
    {
      name: 'Maldark',
      spec: SPECS.ARMS_WARRIOR,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/stormscale/Maldark',
    },
  ],
};
export const hatra344: Contributor = {
  nickname: 'hatra344',
  github: 'hatra344',
};
export const emallson: Contributor = {
  nickname: 'emallson',
  github: 'emallson',
  avatar: avatar('emallson-avatar.jpg'),
};
export const Gebuz: Contributor = {
  nickname: 'Gebuz',
  github: 'Gebuz',
  discord: 'Gebuz#5801',
  avatar: avatar('gebuz-avatar.jpg'),
  about: 'Balance Druid theorycrafter and top end mythic raider.',
  mains: [
    {
      name: 'Gebuz',
      spec: SPECS.BALANCE_DRUID,
      link: 'http://eu.battle.net/wow/character/nagrand/Gebuz/',
    },
  ],
  alts: [
    {
      name: 'Gebuzstab',
      spec: SPECS.SUBTLETY_ROGUE,
      link: 'http://eu.battle.net/wow/character/nagrand/Gebuzstab/',
    },
    {
      name: 'Gebuzpray',
      spec: SPECS.DISCIPLINE_PRIEST,
      link: 'http://eu.battle.net/wow/character/nagrand/Gebuzpray/',
    },
    {
      name: 'Gebuzgrip',
      spec: SPECS.BLOOD_DEATH_KNIGHT,
      link: 'http://eu.battle.net/wow/character/nagrand/Gebuzgrip/',
    },
    {
      name: 'Gebuzroll',
      spec: SPECS.BREWMASTER_MONK,
      link: 'http://eu.battle.net/wow/character/nagrand/Gebuzroll/',
    },
  ],
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
export const nullDozzer: Contributor = {
  nickname: 'nullDozzer',
  github: 'oBusk',
  discord: 'nullDozzer#1179',
  avatar: avatar('nullDozzer-avatar.jpg'),
  mains: [
    {
      name: 'Basically',
      spec: SPECS.WINDWALKER_MONK,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/daggerspine/basically',
    },
  ],
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
  avatar: avatar('Zeboot-avatar.jpg'),
  mains: [
    {
      name: 'Zebeer',
      spec: SPECS.BREWMASTER_MONK,
      link: 'https://worldofwarcraft.com/en-us/character/us/whisperwind/zebeer',
    },
    {
      name: 'Zeaccent',
      spec: SPECS.PROTECTION_PALADIN,
      link: 'https://worldofwarcraft.com/en-us/character/us/whisperwind/Zeaccent',
    },
  ],
  alts: [
    {
      name: 'Zebot',
      spec: SPECS.PROTECTION_WARRIOR,
      link: 'https://worldofwarcraft.com/en-us/character/us/area-52/Zebot',
    },
    {
      name: 'Zeboot',
      spec: SPECS.GUARDIAN_DRUID,
      link: 'https://worldofwarcraft.com/en-us/character/us/whisperwind/zeboot',
    },
  ],
};
export const HawkCorrigan: Contributor = {
  nickname: 'HawkCorrigan',
  github: 'HawkCorrigan',
};
export const Vetyst: Contributor = {
  nickname: 'Vetyst',
  github: 'vetyst',
  discord: 'vetyst',
  avatar: avatar('vetyst-avatar.png'),
  mains: [
    {
      name: 'Vetiest',
      spec: SPECS.SHADOW_PRIEST,
      link: 'https://worldofwarcraft.com/en-gb/character/ragnaros/vetiest',
    },
  ],
};
export const DoxAshe: Contributor = {
  nickname: 'DoxAshe',
  github: 'DoxAshe',
  discord: 'DoxAshe#8269',
};
export const Havoc: Contributor = {
  nickname: 'Havoc',
  github: 'comp615',
  discord: 'Havoc#1035',
};
export const Vireve: Contributor = {
  nickname: 'Vireve',
  github: 'JeaneC',
  discord: 'Vireve#1186',
};
export const Anatta336: Contributor = {
  nickname: 'Anatta336',
  github: 'Anatta336',
  discord: 'Anatta#5878',
};
export const Scaleable: Contributor = {
  nickname: 'Scaleable',
  github: 'wkrueger',
  avatar: avatar('scaleable-avatar.jpg'),
};
export const Cloake: Contributor = {
  nickname: 'Cloake',
  github: 'adilasif',
  discord: 'Cloake#9930',
  mains: [
    {
      name: 'Trixx',
      spec: SPECS.ASSASSINATION_ROGUE,
      link: 'https://worldofwarcraft.com/en-us/character/kelthuzad/Trixx',
    },
  ],
};
export const joshinator: Contributor = {
  nickname: 'joshinator',
  github: 'joshinat0r',
  discord: 'joshinator#7267',
  mains: [
    {
      name: 'Êxtêndêd',
      spec: SPECS.BLOOD_DEATH_KNIGHT,
      link: 'https://worldofwarcraft.com/en-gb/character/eredar/Êxtêndêd',
    },
  ],
};
export const niseko: Contributor = {
  nickname: 'niseko',
  github: 'niseko',
  discord: 'niseko#4130',
  avatar: avatar('niseko-avatar.jpg'),
  mains: [
    {
      name: 'Niseko',
      spec: SPECS.RESTORATION_SHAMAN,
      link: 'https://worldofwarcraft.com/en-gb/character/draenor/niseko',
    },
    {
      name: 'Nisefy',
      spec: SPECS.HOLY_PRIEST,
      link: 'https://worldofwarcraft.com/en-gb/character/draenor/furryweeb',
    },
  ],
  links: {
    'Ancestral Guidance': 'https://ancestralguidance.com/',
  },
};
export const Aelexe: Contributor = {
  nickname: 'Aelexe',
  github: 'Aelexe',
  avatar: avatar('Aelexe-avatar.jpg'),
  mains: [
    {
      name: 'Aelexe',
      spec: SPECS.HOLY_PALADIN,
      link: 'https://worldofwarcraft.com/en-us/character/frostmourne/aelexe',
    },
  ],
};
export const CubeLuke: Contributor = {
  nickname: 'CubeLuke',
  github: 'CubeLuke',
  discord: 'CubeLuke#8595',
  avatar: avatar('CubeLuke-avatar.jpg'),
  mains: [
    {
      name: 'Monachi',
      spec: SPECS.MISTWEAVER_MONK,
      link: 'https://worldofwarcraft.com/en-us/character/bleeding-hollow/monachi',
    },
  ],
};
export const ackwell: Contributor = {
  nickname: 'ackwell',
  github: 'ackwell',
  discord: 'ackwell#3835',
  avatar: avatar('ackwell-avatar.jpg'),
};
export const regret: Contributor = {
  nickname: 'regret',
  github: 'remyaraya',
  discord: 'regret#8633',
  mains: [
    {
      name: 'Ratchrat',
      spec: SPECS.HOLY_PALADIN,
      link: 'https://worldofwarcraft.com/en-us/character/thrall/ratchrat',
    },
  ],
};
export const Khadaj: Contributor = {
  nickname: 'Khadaj',
  github: 'tjmoats',
  discord: 'Khadaj#3519',
  avatar: avatar('khadaj-avatar.jpg'),
  mains: [
    {
      name: 'Khadaj',
      spec: SPECS.HOLY_PRIEST,
      link: 'https://worldofwarcraft.com/en-us/character/firetree/khadaj',
    },
    {
      name: 'RatherBeBelf',
      spec: SPECS.HOLY_PRIEST,
      link: '',
    },
  ],
};
export const fel1ne: Contributor = {
  nickname: 'fel1ne',
  github: 'fel1n3',
  discord: 'Dr. fel1ne#5614',
  avatar: avatar('fel1ne-avatar.png'),
  mains: [
    {
      name: 'Felerai',
      spec: SPECS.RESTORATION_DRUID,
      link: 'https://www.worldofwarcraft.com/en-us/character/khazgoroth/Felerai',
    },
  ],
};
export const Dambroda: Contributor = {
  nickname: 'Dambroda',
  github: 'Dambroda',
  discord: 'Dambroda#1290',
  avatar: avatar('Dambroda-avatar.jpg'),
  mains: [
    {
      name: 'Dambroma',
      spec: SPECS.FROST_MAGE,
      link: 'https://worldofwarcraft.com/en-us/character/stormrage/dambroma',
    },
  ],
};
export const Nalhan: Contributor = {
  nickname: 'Nalhan',
  github: 'Nalhan',
  discord: 'rye bread#9105',
  mains: [
    {
      name: 'Doughmaker',
      spec: SPECS.DISCIPLINE_PRIEST,
      link: 'http://us.battle.net/wow/character/arthas/Doughmaker',
    },
  ],
};
export const Satyric: Contributor = {
  nickname: 'Satyric',
  github: 'kujan',
  discord: 'Satyric#9107',
  mains: [
    {
      name: 'Satyric',
      spec: SPECS.HOLY_PALADIN,
      link: 'https://worldofwarcraft.com/en-gb/character/ragnaros/Satyric',
    },
  ],
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
  avatar: avatar('matardarix-avatar.jpg'),
  mains: [
    {
      name: 'Matärdarix',
      spec: SPECS.BREWMASTER_MONK,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/hyjal/Mat%C3%A4rdarix',
    },
  ],
};
export const mtblanton: Contributor = {
  nickname: 'mtblanton',
  github: 'mtblanton',
  mains: [
    {
      name: 'Harzwaz',
      spec: SPECS.ENHANCEMENT_SHAMAN,
      link: 'https://worldofwarcraft.com/en-us/character/turalyon/Harzwaz',
    },
  ],
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
  mains: [
    {
      name: 'Uzdrowiciela',
      spec: SPECS.RESTORATION_DRUID,
      link: 'https://worldofwarcraft.com/en-gb/character/sylvanas/Uzdrowiciela',
    },
  ],
};
export const Dorixius: Contributor = {
  nickname: 'Dorixius',
  github: 'florianschut',
  avatar: avatar('dorixius-avatar.jpeg'),
  discord: 'Florian#9270',
  mains: [
    {
      name: 'Dorixius',
      spec: SPECS.UNHOLY_DEATH_KNIGHT,
      link: 'https://worldofwarcraft.com/en-gb/character/steamwheedle-cartel/Dorixius',
    },
  ],
};
export const Skeletor: Contributor = {
  nickname: 'Skeletor',
  github: 'LordSkeletor',
  discord: 'Skeletor#0001',
  avatar: avatar('Skeletor_avatar.png'),
  mains: [
    {
      name: 'Ilivath',
      spec: SPECS.RETRIBUTION_PALADIN,
      link: 'https://worldofwarcraft.com/en-us/character/zuljin/Ilivath',
    },
  ],
  links: {
    'RetPaladin.XYZ': 'https://www.retpaladin.xyz/ret-paladin-8-1-0-pve-guide',
  },
};
export const Abelito75: Contributor = {
  nickname: 'Abelito75',
  github: 'abelito75',
  avatar: avatar('Abelito75-avatar.png'),
  about: 'Guy doing random things',
};
export const HolySchmidt: Contributor = {
  nickname: 'HolySchmidt',
  github: '5chmidt',
  avatar: avatar('holyschmidt-avatar.jpg'),
  about: 'Holy Paladin, Tinkerer',
  mains: [
    {
      name: 'HolySchmidt',
      spec: SPECS.HOLY_PALADIN,
      link: 'https://worldofwarcraft.com/en-us/character/us/whisperwind/holyschmidt',
    },
  ],
};
export const Coywolf: Contributor = {
  nickname: 'Coywolf',
  github: 'Coywolf',
  discord: 'Coywolf#3500',
  mains: [
    {
      name: 'Coywolf',
      spec: SPECS.OUTLAW_ROGUE,
      link: 'https://worldofwarcraft.com/en-us/character/us/arthas/coywolf',
    },
  ],
};
export const Scotsoo: Contributor = {
  nickname: 'Scotsoo',
  github: 'Scotsoo',
  discord: 'Scotsoo#5328',
  avatar: avatar('Scotsoo-avatar.jpg'),
  mains: [
    {
      name: 'Scotsoodh',
      spec: SPECS.HAVOC_DEMON_HUNTER,
      link: 'https://worldofwarcraft.com/en-us/character/eu/tarren-mill/scotsoodh',
    },
  ],
};
export const LeoZhekov: Contributor = {
  nickname: 'LeoZhekov',
  github: 'LeoZhekov',
  discord: 'LeoZhekov#6641',
  avatar: avatar('LeoZhekov-avatar.jpg'),
  mains: [
    {
      name: 'Lisossa',
      spec: SPECS.SURVIVAL_HUNTER,
      link: 'https://worldofwarcraft.com/en-gb/character/Ravencrest/Lisossa',
    },
  ],
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
  mains: [
    {
      name: 'Shrom',
      spec: SPECS.BALANCE_DRUID,
      link: 'https://worldofwarcraft.com/en-us/character/us/frostmourne/shrom',
    },
  ],
};
export const Draenal: Contributor = {
  nickname: 'Draenal',
  github: 'MikeCook9994',
  mains: [
    {
      name: 'Draenal',
      spec: SPECS.ELEMENTAL_SHAMAN,
      link: 'https://worldofwarcraft.com/en-us/character/us/malganis/draenal',
    },
    {
      name: 'MagicEraser',
      spec: SPECS.FROST_MAGE,
      link: 'https://worldofwarcraft.com/en-us/character/us/malganis/magiceraser',
    },
  ],
};
export const Adoraci: Contributor = {
  nickname: 'Adoraci',
  github: 'DylanDirlam',
  discord: 'Adoraci#0001',
  avatar: avatar('Adoraci-avatar.jpg'),
  mains: [
    {
      name: 'Adoracii',
      spec: SPECS.FIRE_MAGE,
      link: 'https://worldofwarcraft.com/en-us/character/us/zuljin/adoracii',
    },
    {
      name: 'Adoraci',
      spec: SPECS.SHADOW_PRIEST,
      link: 'https://worldofwarcraft.com/en-us/character/us/zuljin/adoraci',
    },
  ],
};
export const TheJigglr: Contributor = {
  nickname: 'TheJigglr',
  github: 'myran2',
  discord: 'Henry#4712',
  mains: [
    {
      name: 'Thejigglr',
      spec: SPECS.ELEMENTAL_SHAMAN,
      link: 'https://worldofwarcraft.com/en-us/character/us/bleeding-hollow/thejigglr',
    },
  ],
};
export const fluffels: Contributor = {
  nickname: 'fluffels',
  github: 'fluffels',
  discord: 'fluffels#4322',
  mains: [
    {
      name: 'Micheladaw',
      spec: SPECS.AFFLICTION_WARLOCK,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/draenor/micheladaw',
    },
  ],
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
  avatar: avatar('taleria-avatar.jpg'),
  mains: [
    {
      name: 'Taleria',
      spec: SPECS.HOLY_PALADIN,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/eonar/Taleria',
    },
  ],
};
export const axelkic: Contributor = {
  nickname: 'axelkic',
  github: 'axelkic',
};
export const soloxcx: Contributor = {
  nickname: 'soloxcx',
  github: 'soloxcx',
  discord: 'Connor#7037',
  avatar: avatar('soloxcx-avatar.jpg'),
  mains: [
    {
      name: 'Vaerminà',
      spec: SPECS.OUTLAW_ROGUE,
      link: 'https://worldofwarcraft.com/en-us/character/us/thrall/Vaermin%C3%A0',
    },
  ],
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
  avatar: avatar('FraunchToost-avatar.png'),
  mains: [
    {
      name: 'Azamia',
      spec: SPECS.MISTWEAVER_MONK,
      link: 'https://worldofwarcraft.com/en-us/character/us/area-52/Azamia',
    },
  ],
};
export const Tiphess: Contributor = {
  nickname: 'Tiphess',
  github: 'Tiphess',
  discord: 'Tiphess#0324',
  avatar: avatar('Tiphess-avatar.jpeg'),
  mains: [
    {
      name: 'Tjphess',
      spec: SPECS.DISCIPLINE_PRIEST,
      link: 'https://worldofwarcraft.com/en-us/character/us/zuljin/tjphess',
    },
  ],
};
export const Tyndi: Contributor = {
  nickname: 'Tyndi',
  github: 'darthelit',
  discord: 'Tyndi#4337',
  avatar: avatar('tyndi-avatar.png'),
};
export const MusicMeister: Contributor = {
  nickname: 'MusicMeister',
  github: 'TheMusicMeister',
  discord: 'The Music Meister#8236',
  mains: [
    {
      name: 'Leviisa',
      spec: SPECS.ENHANCEMENT_SHAMAN,
      link: 'https://worldofwarcraft.com/en-us/character/us/illidan/leviisa',
    },
  ],
};
export const Moonrabbit: Contributor = {
  nickname: 'Moonrabbit',
  github: 'alliepet',
};
export const Vohrr: Contributor = {
  nickname: 'Vohrr',
  github: 'pingypong',
  discord: 'Vohrr#3091',
  avatar: avatar('vohrr-avatar.jpg'),
  about: 'Mistweaver and Preservation Theorycafter. Vet in Peak of Serenity',
  mains: [
    {
      name: 'Vohrr',
      spec: SPECS.MISTWEAVER_MONK,
      link: 'https://worldofwarcraft.com/en-us/character/us/illidan/vohrr',
    },
    {
      name: 'Vokeri',
      spec: SPECS.PRESERVATION_EVOKER,
      link: 'https://worldofwarcraft.com/en-us/character/us/illidan/vokeri',
    },
  ],
  alts: [
    {
      name: 'Vokori',
      spec: SPECS.DISCIPLINE_PRIEST,
      link: 'https://worldofwarcraft.com/en-us/character/us/malganis/vokori',
    },
    {
      name: 'Vohrpal',
      spec: SPECS.HOLY_PALADIN,
      link: 'https://worldofwarcraft.com/en-us/character/us/sargeras/vohrpal',
    },
    {
      name: 'Vohrrtide',
      spec: SPECS.RESTORATION_SHAMAN,
      link: 'https://worldofwarcraft.com/en-us/character/us/malganis/Vohrrtide',
    },
    {
      name: 'Vohrbloom',
      spec: SPECS.RESTORATION_DRUID,
      link: 'https://worldofwarcraft.com/en-us/character/us/malganis/vohrbloom',
    },
  ],
};

export const Vonn: Contributor = {
  nickname: 'Vonn',
  github: 'kenrms',
  discord: 'vønn#2776',
  avatar: avatar('vonn-avatar.jpg'),
  mains: [
    {
      name: 'Vønn',
      spec: SPECS.ENHANCEMENT_SHAMAN,
      link: 'https://worldofwarcraft.com/en-us/character/turalyon/vønn',
    },
  ],
};
export const AdamKelly: Contributor = {
  nickname: 'AdamKelly',
  github: 'Adammkelly',
  discord: 'Overload#0899',
  avatar: avatar('karagus-avatar.jpg'),
  mains: [
    {
      name: 'Karagus',
      spec: SPECS.ELEMENTAL_SHAMAN,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/defias-brotherhood/Karagus',
    },
  ],
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
  github: 'giubatt',
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
  avatar: avatar('amani_avatar.png'),
  mains: [
    {
      name: 'Аманя',
      spec: SPECS.ELEMENTAL_SHAMAN,
      link: 'https://www.warcraftlogs.com/character/id/42517322',
    },
  ],
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
  avatar: avatar('Mae_avatar.png'),
  mains: [
    {
      name: 'Maelock',
      spec: SPECS.DEMONOLOGY_WARLOCK,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/stormscale/maelock',
    },
  ],
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
  mains: [
    {
      name: 'Kaylleen',
      spec: SPECS.DISCIPLINE_PRIEST,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/silvermoon/kaylleen',
    },
    {
      name: 'Elastan',
      spec: SPECS.PROTECTION_PALADIN,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/silvermoon/elastan',
    },
  ],
};

export const Maleficien: Contributor = {
  nickname: 'Maleficien',
  github: 'kevindqc',
  discord: 'DaRkViRuS#1070',
  mains: [
    {
      name: 'Maleficien',
      spec: SPECS.AFFLICTION_WARLOCK,
      link: 'https://worldofwarcraft.com/en-us/character/us/zuljin/maleficien',
    },
  ],
};
export const Xcessiv: Contributor = {
  nickname: 'Xcessiv',
  github: 'jwmclark',
  avatar: avatar('xcessiv-avatar.jpg'),
  discord: 'Xcessiv#6732',
  mains: [
    {
      name: 'Xcessiv',
      spec: SPECS.FERAL_DRUID,
      link: 'https://worldofwarcraft.com/en-us/character/us/thrall/xcessiv',
    },
  ],
};

export const Tora: Contributor = {
  nickname: 'Tora',
  github: 'RobinKa',
  discord: 'Tora#1871',
  mains: [
    {
      name: 'Nuhrok',
      spec: SPECS.FERAL_DRUID,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/tarren-mill/Nuhrok',
    },
  ],
  links: {
    Website: 'https://warlock.ai',
  },
};
export const Kettlepaw: Contributor = {
  nickname: 'Kettlepaw',
  github: 'abbottmg',
  discord: 'abbott#2506',
  mains: [
    {
      name: 'Caeldrim',
      spec: SPECS.GUARDIAN_DRUID,
      link: 'https://worldofwarcraft.com/en-us/character/us/wyrmrest-accord/caeldrim',
    },
    {
      name: 'Kettlepaw',
      spec: SPECS.BREWMASTER_MONK,
      link: 'https://worldofwarcraft.com/en-us/character/us/wyrmrest-accord/kettlepaw',
    },
  ],
};

export const g3neral: Contributor = {
  nickname: 'g3neral',
  github: 'g3neral-wow',
  discord: 'g3neral#2455',
  mains: [
    {
      name: 'Nethershift',
      spec: SPECS.FERAL_DRUID,
      link: 'https://worldofwarcraft.com/en-us/character/us/proudmoore/Nethershift',
    },
  ],
};

export const flurreN: Contributor = {
  nickname: 'flurreN',
  github: 'flurreN',
  discord: 'flurreN#6099',
  mains: [
    {
      name: 'Zyg',
      spec: SPECS.HAVOC_DEMON_HUNTER,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/stormscale/zyg',
    },
  ],
};

export const Carrottopp: Contributor = {
  nickname: 'Carrottopp',
  github: 'Chasson1992',
  avatar: avatar('Carrottopp_avatar.png'),
  discord: 'Carrottopp#2592',
  mains: [
    {
      name: 'Carrottopp',
      spec: SPECS.ARMS_WARRIOR,
      link: 'https://worldofwarcraft.com/en-us/character/us/stormrage/carrottopp',
    },
  ],
};

export const Toreole: Contributor = {
  nickname: 'Toreole',
  github: 'Toreole',
  discord: 'Toreole#0001',
  mains: [
    {
      name: 'Crowfield',
      spec: SPECS.ARMS_WARRIOR,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/silvermoon/crowfield',
    },
  ],
};

export const Vexxra: Contributor = {
  nickname: 'Vexxra',
  github: 'vexxra',
};

export const TurianSniper: Contributor = {
  nickname: 'TurianSniper',
  github: 'tjw87912',
  discord: 'TurianSniper#2941',
  mains: [
    {
      name: 'Nakofel',
      spec: SPECS.VENGEANCE_DEMON_HUNTER,
      link: 'https://worldofwarcraft.com/en-us/character/us/bleeding-hollow/nakofel',
    },
  ],
};

export const Geeii: Contributor = {
  nickname: 'Geeii',
  github: 'radean0909',
  discord: 'Geei#8447',
  mains: [
    {
      name: 'Geeii',
      spec: SPECS.VENGEANCE_DEMON_HUNTER,
      link: 'https://worldofwarcraft.com/en-us/character/us/area52/geei',
    },
  ],
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
  avatar: avatar('barry-avatar.jpg'),
  mains: [
    {
      name: 'Druulux',
      spec: SPECS.RESTORATION_DRUID,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/silvermoon/druulux',
    },
  ],
};

export const Otthopsy: Contributor = {
  nickname: 'Otthopsy',
  github: 'Otthopsy',
  discord: 'Ottopsy#5666',
  mains: [
    {
      name: 'Otthopsy',
      spec: SPECS.ARMS_WARRIOR,
      link: 'https://worldofwarcraft.com/fr-fr/character/eu/ysondre/otthopsy',
    },
    {
      name: 'Rayhløren',
      spec: SPECS.RESTORATION_DRUID,
      link: 'https://worldofwarcraft.com/fr-fr/character/eu/ysondre/rayhl%C3%B8ren',
    },
  ],
};

export const Tiboonn: Contributor = {
  nickname: 'Tiboonn',
  github: 'Tiboonn',
};

export const Buudha: Contributor = {
  nickname: 'Buudha',
  github: 'Phatso1973',
  discord: 'Shifty#8510',
  mains: [
    {
      name: 'Buudha',
      spec: SPECS.GUARDIAN_DRUID,
      link: 'https://worldofwarcraft.com/en-us/character/us/dalaran/buudha',
    },
  ],
};

export const Makhai: Contributor = {
  nickname: 'Makhai',
  github: 'Tikers',
  discord: 'Makhai#3086',
  mains: [
    {
      name: 'Mákhai#3086',
      spec: SPECS.VENGEANCE_DEMON_HUNTER,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/defias-brotherhood/m%C3%A1khai',
    },
  ],
};

export const Canotsa: Contributor = {
  nickname: 'Canotsa',
  github: 'CasperKjaerhus',
  discord: 'Canotsa#3725',
  mains: [
    {
      name: 'Stabdagger',
      spec: SPECS.OUTLAW_ROGUE,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/draenor/stabdagger',
    },
  ],
};

export const Maximaw: Contributor = {
  nickname: 'Maximaw',
  github: 'defunes43',
  discord: 'Maximaw#7408',
  mains: [
    {
      name: 'Maximaw',
      spec: SPECS.ELEMENTAL_SHAMAN,
      link: 'https://worldofwarcraft.com/fr-fr/character/eu/ysondre/maximaw',
    },
  ],
};
export const TrellinXp: Contributor = {
  nickname: 'TrellinXp',
  github: 'TrellinXp',
  discord: 'Trellin#2428',
  mains: [
    {
      name: 'Turinus',
      spec: SPECS.BEAST_MASTERY_HUNTER,
      link: 'https://worldofwarcraft.com/de-de/character/eu/blackmoore/turinus',
    },
  ],
};

export const jasper: Contributor = {
  nickname: 'jasper',
  github: 'jasper-priest',
  discord: 'jasper#6666',
  avatar: avatar('jasper-avatar.png'),
  mains: [
    {
      name: 'Jasper',
      spec: SPECS.DISCIPLINE_PRIEST,
      link: 'https://worldofwarcraft.com/en-us/character/us/dreadmaul/Jasper',
    },
  ],
};

export const Procyon: Contributor = {
  nickname: 'Procyon',
  github: 'procy-dev',
  discord: 'procy-dev#3837',
  mains: [
    {
      name: 'Xígbar',
      spec: SPECS.SHADOW_PRIEST,
      link: 'https://worldofwarcraft.com/en-us/character/us/bleeding-hollow/X%C3%ADgbar',
    },
  ],
};

export const Ciuffi: Contributor = {
  nickname: 'Ciuffi',
  github: 'Ciuffi',
  discord: 'ciuffi#6794',
  mains: [
    {
      name: 'Ciuffi',
      spec: SPECS.RESTORATION_DRUID,
      link: 'https://worldofwarcraft.com/en-us/character/us/illidan/ciuffi',
    },
  ],
};

export const Kartarn: Contributor = {
  nickname: 'Kartarn',
  github: 'sLaiN1',
  discord: 'sLaiN#7095',
  mains: [
    {
      name: 'Kartarn',
      spec: SPECS.BALANCE_DRUID,
      link: 'https://worldofwarcraft.com/de-de/character/eu/eredar/kartarn',
    },
  ],
};

export const Pendragon: Contributor = {
  nickname: 'Pendragon',
  github: 'Pendragon64',
  discord: 'Pendragon#7845',
  avatar: avatar('pendragon-avatar.jpg'),
  mains: [
    {
      name: 'Larison',
      spec: SPECS.FROST_DEATH_KNIGHT,
      link: 'https://worldofwarcraft.com/en-us/character/us/stormrage/larison',
    },
  ],
};

export const acornellier: Contributor = {
  nickname: 'acornellier',
  github: 'acornellier',
  discord: 'Ortemis#3934',
  mains: [
    {
      name: 'Ortemis',
      spec: SPECS.HOLY_PALADIN,
      link: 'https://worldofwarcraft.com/en-us/character/us/sargeras/ortemis',
    },
  ],
};

export const Akai: Contributor = {
  nickname: 'Akai',
  github: 'akaiwow21',
  discord: 'supbro123#2933',
};

export const maestrohdude: Contributor = {
  nickname: 'maestrohdude',
  github: 'maestrohdude',
  discord: 'maestrohdude#6100',
};

export const Bloodfox: Contributor = {
  nickname: 'Bloodfox',
  github: 'sspeaks',
};

export const wmavis: Contributor = {
  nickname: 'wmavis',
  github: 'wmavis',
  discord: 'Willard#6784',
  mains: [
    {
      name: 'Poiple',
      spec: SPECS.ASSASSINATION_ROGUE,
      link: 'https://worldofwarcraft.com/en-us/character/us/shattered-hand/poiple',
    },
  ],
  alts: [
    {
      name: 'Purrpal',
      spec: SPECS.RESTORATION_SHAMAN,
      link: 'https://worldofwarcraft.com/en-us/character/us/shattered-hand/purrpal',
    },
    {
      name: 'Prrpll',
      spec: SPECS.BLOOD_DEATH_KNIGHT,
      link: 'https://worldofwarcraft.com/en-us/character/us/shattered-hand/prrpll',
    },
  ],
};

export const niko: Contributor = {
  nickname: 'niko',
  github: 'nicholasRutherford',
  discord: 'niko#8550',
  mains: [
    {
      name: 'Poro',
      spec: SPECS.BREWMASTER_MONK,
      link: 'https://worldofwarcraft.com/en-us/character/us/wildhammer/poro',
    },
  ],
};

export const carglass: Contributor = {
  nickname: 'carglass',
  github: 'Carglass',
  discord: 'Bubu#7424',
  mains: [
    {
      name: 'Buldoru',
      spec: SPECS.DISCIPLINE_PRIEST,
      link: 'https://worldofwarcraft.com/en-us/character/us/aerie-peak/buldoru',
    },
  ],
};

export const Zea: Contributor = {
  nickname: 'Zea',
  github: 'kedearian',
};

export const ogunb: Contributor = {
  nickname: 'ogunb',
  github: 'ogunb',
  discord: 'ogunb#5781',
  avatar: avatar('ogunb-avatar.jpg'),
  mains: [
    {
      name: 'Throlnoz',
      spec: SPECS.DESTRUCTION_WARLOCK,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/silvermoon/Throlnoz',
    },
  ],
};

export const Klex: Contributor = {
  nickname: 'Klex',
  github: 'BjarkeM',
  discord: 'Klex#3053',
  mains: [
    {
      name: 'Slowfood',
      spec: SPECS.ARCANE_MAGE,
      link: 'https://classic.warcraftlogs.com/character/eu/earthshaker/slowfood',
    },
  ],
};

export const Pink: Contributor = {
  nickname: 'Pink',
  github: 'marson',
  mains: [
    {
      name: 'Pinklight',
      spec: SPECS.SHADOW_PRIEST,
      link: 'https://www.warcraftlogs.com/character/eu/azjolnerub/pinklight',
    },
  ],
};

export const Pirrang: Contributor = {
  nickname: 'Pirrang',
  discord: 'Pirrang#1818',
  github: 'Pirrang',
  mains: [
    {
      name: 'Sansukie',
      spec: SPECS.AFFLICTION_WARLOCK,
      link: 'https://www.warcraftlogs.com/character/eu/kazzak/sansukie',
    },
  ],
};

export const Elodiel: Contributor = {
  nickname: 'Elodiel',
  discord: 'Elodiel#5981',
  github: 'ElodielAirea',
  mains: [
    {
      name: 'Yusun',
      spec: SPECS.HAVOC_DEMON_HUNTER,
      link: 'https://www.warcraftlogs.com/character/eu/thrall/yusun',
    },
  ],
};

export const Charurun: Contributor = {
  nickname: 'Charurun',
  discord: 'char *#7024',
  github: 'mryanlam',
  mains: [
    {
      name: 'Charurun',
      spec: SPECS.PROTECTION_WARRIOR,
      link: 'https://classic.warcraftlogs.com/character/id/40985537',
    },
    {
      name: 'Charuru',
      spec: SPECS.RETRIBUTION_PALADIN,
      link: 'https://classic.warcraftlogs.com/character/id/42940009',
    },
  ],
};

export const Talador12: Contributor = {
  nickname: 'Talador12',
  discord: 'Talador12#4269',
  github: 'Talador12',
  mains: [
    {
      name: 'Kikori',
      spec: SPECS.DESTRUCTION_WARLOCK,
      link: 'https://classic.warcraftlogs.com/character/id/60308170',
    },
  ],
};

export const Karahtar: Contributor = {
  nickname: 'Karahtar',
  discord: 'Karahtar#8859',
  github: 'npaganini',
  mains: [
    {
      name: 'Karatar',
      spec: SPECS.ARCANE_MAGE,
      link: 'https://www.warcraftlogs.com/character/us/kelthuzad/karatar',
    },
  ],
};

export const bandit: Contributor = {
  nickname: 'bandit',
  github: 'elasticspoon',
};

export const ChrisKaczor: Contributor = {
  nickname: 'Chris Kaczor',
  github: 'ckaczor',
};

export const Yax: Contributor = {
  nickname: 'Yax',
  github: 'WarcraftYax',
  avatar: avatar('Yax-avatar.jpg'),
  mains: [
    {
      name: 'Xyä',
      spec: SPECS.VENGEANCE_DEMON_HUNTER,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/kazzak/Xy%C3%A4',
    },
  ],
  alts: [
    {
      name: 'Blodhgärm',
      spec: SPECS.GUARDIAN_DRUID,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/kazzak/Blodhg%C3%A4rm',
    },
    {
      name: 'Äxy',
      spec: SPECS.FURY_WARRIOR,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/kazzak/%C3%84xy',
    },
  ],
};

export const darkpsy3934: Contributor = {
  nickname: 'Terise',
  github: 'darkpsy3934',
  mains: [
    {
      name: 'Terise',
      spec: SPECS.FROST_DEATH_KNIGHT,
      link: 'https://www.warcraftlogs.com/character/us/blades-edge/terise',
    },
  ],
};

export const Arbixal: Contributor = {
  nickname: 'Arbixal',
  discord: 'Arbixal#0565',
  github: 'Arbixal',
  about: 'TBC healer theorycrafter, but mostly resto shaman.',
  avatar: avatar('arbixal-avatar.png'),
};

export const Trevor: Contributor = {
  nickname: 'Trevor',
  discord: 'Trevor#9816',
  github: 'trevorm4',
  avatar: avatar('Trevor-avatar.png'),
};

export const Harrek: Contributor = {
  nickname: 'Harrek',
  discord: 'harrek',
  github: 'Harreks',
  avatar: avatar('Harrek-avatar.png'),
};

export const Jeff: Contributor = {
  nickname: 'Jeff',
  discord: 'muhnameizjeff#8143',
  github: 'jander99',
  about: 'Software Engineer and WoW player. Recovering EverCrack addict.',
  mains: [
    {
      name: 'Theragrin',
      spec: SPECS.RETRIBUTION_PALADIN,
      link: 'https://worldofwarcraft.com/en-us/character/us/dalaran/Theragrin',
    },
  ],
  alts: [
    {
      name: 'Wörgrin',
      spec: SPECS.BALANCE_DRUID,
      link: 'https://worldofwarcraft.com/en-us/character/us/dalaran/W%C3%B6rgrin',
    },
    {
      name: 'Jeffortless',
      spec: SPECS.ELEMENTAL_SHAMAN,
      link: 'https://worldofwarcraft.com/en-us/character/us/dalaran/Jeffortless',
    },
  ],
};

export const Hursti: Contributor = {
  nickname: 'Hursti',
  github: 'Hurstilol',
};
export const Shamorisse: Contributor = {
  nickname: 'Shamorisse',
  github: 'Amorisse',
  discord: 'Amorisse#8013',
  avatar: avatar('Shamorisse-avatar.jpg'),
  mains: [
    {
      name: 'Shamorisse',
      spec: SPECS.RESTORATION_SHAMAN,
      link: 'https://worldofwarcraft.com/en-us/character/us/malganis/Shamorisse',
    },
  ],
};

export const Llanas: Contributor = {
  nickname: 'Llanas',
  github: 'llanas',
};
export const xizbow: Contributor = {
  nickname: 'xizbow',
  discord: 'xizbow',
  github: 'xizbow1',
  mains: [
    {
      name: 'Gregskull',
      spec: SPECS.HOLY_PRIEST,
      link: 'https://www.warcraftlogs.com/character/us/zuljin/gregskull',
    },
  ],
};

export const Tialyss: Contributor = {
  nickname: 'Tialyss',
  discord: 'tialyss#0087',
  github: 'mfield',
};

export const xunni: Contributor = {
  nickname: 'xunni',
  github: 'sorrellp',
  mains: [
    {
      name: 'Xunni',
      spec: SPECS.ENHANCEMENT_SHAMAN,
      link: 'https://worldofwarcraft.com/en-us/character/us/area-52/xunni',
    },
  ],
};

export const Taum: Contributor = {
  nickname: 'Taum',
  github: 'Taum',
  mains: [
    {
      name: 'Taum',
      spec: SPECS.ENHANCEMENT_SHAMAN,
      link: 'https://worldofwarcraft.com/en-us/character/us/zuljin/Shm',
    },
  ],
};

export const AndreasAlbert: Contributor = {
  nickname: 'AndreasAlbert',
  github: 'AndreasAlbert',
};

export const xepheris: Contributor = {
  nickname: 'xepheris',
  github: 'ljosberinn',
  discord: 'Chevron#6539',
  twitter: 'gerrit_alex',
  mains: [
    {
      name: 'Xepheris',
      spec: SPECS.VENGEANCE_DEMON_HUNTER,
      link: 'https://worldofwarcraft.com/en-us/character/eu/blackmoore/Xepheris',
    },
  ],
};

export const Woliance: Contributor = {
  nickname: 'Woliance',
  github: 'Woliance',
  discord: 'Woliance',
  mains: [
    {
      name: 'Woliance',
      spec: SPECS.PROTECTION_PALADIN,
      link: 'https://worldofwarcraft.blizzard.com/en-gb/character/eu/tarren-mill/Woliance',
    },
  ],
};

export const Hana: Contributor = {
  nickname: 'Hana',
  github: 'OisinOD',
  mains: [
    {
      name: 'Kochouran',
      spec: SPECS.DISCIPLINE_PRIEST,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/kazzak/Kochouran',
    },
  ],
};
export const kate: Contributor = {
  nickname: 'kate',
  github: 'renanthera',
};

export const Lucky0604: Contributor = {
  nickname: 'Lucky',
  github: 'lucky0604',
  avatar: avatar('lucky0604.png'),
  discord: 'Lucky0604#8966',
};

export const Omegabiscuit: Contributor = {
  nickname: 'Omegabiscuit',
  github: 'omegabiscuit',
};

export const Ahri: Contributor = {
  nickname: 'Ahri',
  github: 'ahriandel',
  discord: 'ahriandel',
};

export const ToppleTheNun: Contributor = {
  nickname: 'ToppleTheNun',
  github: 'ToppleTheNun',
  avatar: avatar('ToppleTheNun-avatar.jpg'),
  discord: 'ToppleTheNun',
  mains: [
    {
      name: 'Toppledh',
      spec: SPECS.VENGEANCE_DEMON_HUNTER,
      link: 'https://worldofwarcraft.blizzard.com/en-us/character/us/area-52/Toppledh',
    },
  ],
};

export const CamClark: Contributor = {
  nickname: 'CamClark',
  github: 'CamClark',
  discord: 'Cool_Clarky#9085',
  mains: [
    {
      name: 'CeoJimmy',
      spec: SPECS.HOLY_PALADIN,
      link: 'https://worldofwarcraft.com/en-us/character/us/frostmourne/Ceojimmy',
    },
  ],
};

export const Phased: Contributor = {
  nickname: 'Phased',
  github: 'bilalm4',
  discord: 'Phased#1267',
  mains: [
    {
      name: 'Phasedruid',
      spec: SPECS.RESTORATION_DRUID,
      link: 'https://worldofwarcraft.com/en-us/character/us/area-52/Phasedruid',
    },
  ],
};

export const Listefano: Contributor = {
  nickname: 'Listefano',
  github: 'listefano',
  discord: 'Listefano | Stefan#8789',
  mains: [
    {
      name: 'Listefano',
      spec: SPECS.FURY_WARRIOR,
      link: 'https://worldofwarcraft.com/en-us/character/eu/malfurion/Listefano',
    },
  ],
};

export const Litena: Contributor = {
  nickname: 'Litena',
  github: 'emilnormann',
  discord: 'BooTheGhoster#9666',
  mains: [
    {
      name: 'Litena',
      spec: SPECS.HOLY_PRIEST,
      link: 'https://worldofwarcraft.com/en-us/character/eu/silvermoon/Litena',
    },
  ],
};

export const manu310891: Contributor = {
  nickname: 'manu310891',
  github: 'manu310891',
};

export const jazminite: Contributor = {
  nickname: 'jazminite',
  github: 'jazminite',
};
export const Pilsung: Contributor = {
  nickname: 'pilsung',
  github: 'Ac1dBomb',
};
export const Jonfanz: Contributor = {
  nickname: 'jonfanz',
  github: 'jharrell',
};
export const Anty: Contributor = {
  nickname: 'Anty',
  github: 'jsucupira',
};
export const Squided: Contributor = {
  nickname: 'Squided',
  github: 'foobartles',
  discord: 'squided#0001',
  mains: [
    {
      name: 'Squided',
      spec: SPECS.HOLY_PALADIN,
      link: 'https://worldofwarcraft.com/en-us/character/us/area-52/Squided',
    },
    {
      name: 'Squidkid',
      spec: SPECS.HOLY_PRIEST,
      link: 'https://worldofwarcraft.com/en-us/character/us/area-52/Squidkid',
    },
  ],
};

export const AlexanderJKremer: Contributor = {
  nickname: 'Jammfheal',
  github: 'alexanderjkremer',
  discord: 'acousticschooler#0653',
  mains: [
    {
      name: 'Jammfheal',
      spec: SPECS.HOLY_PRIEST,
      link: 'https://worldofwarcraft.com/en-us/character/us/bleeding-hollow/jammfheal',
    },
  ],
};
export const Fassbrause: Contributor = {
  nickname: 'Fassbrause',
  github: 'Fassbrause',
  discord: 'Burgerflipper#7351',
  avatar: avatar('fassbrause-avatar.jpg'),
};
export const Greedyhugs: Contributor = {
  nickname: 'Greedy',
  github: 'Matt41531',
  discord: 'MildcatMatt#9089',
  avatar: avatar('greedyhugs-avatar.jpg'),
  mains: [
    {
      name: 'Greedyhugs',
      spec: SPECS.PROTECTION_WARRIOR,
      link: 'https://worldofwarcraft.com/en-us/character/us/zuljin/greedyhugs',
    },
  ],
};
export const Heisenburger: Contributor = {
  nickname: 'Heisenburger',
  github: 'Heisenburger505',
};
export const Lapideas: Contributor = {
  nickname: 'Lapideas',
  github: 'jeremyzahner',
  discord: 'Lapideas#0161',
  mains: [
    {
      name: 'Lapideas',
      spec: SPECS.PROTECTION_WARRIOR,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/blackmoore/lapideas',
    },
  ],
  alts: [
    {
      name: 'Miasmo',
      spec: SPECS.RESTORATION_DRUID,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/blackmoore/miasmo',
    },
  ],
};
export const Durpn: Contributor = {
  nickname: 'Durpn',
  github: 'smvoss',
  discord: 'Durpn#1336',
  avatar: avatar('durpn-avatar.png'),
  mains: [
    {
      name: 'Durpn',
      spec: SPECS.WINDWALKER_MONK,
      link: 'https://worldofwarcraft.com/en-us/character/us/tichondrius/durpn',
    },
  ],
};
export const Klamuz: Contributor = {
  nickname: 'Klamuz',
  github: 'seagomezar',
  discord: 'sebasgojs#1846',
  avatar: avatar('klamuz-avatar.png'),
  mains: [
    {
      name: 'Klamuz',
      spec: SPECS.RETRIBUTION_PALADIN,
      link: 'https://www.warcraftlogs.com/character/us/ragnaros/klamuz',
    },
  ],
};

export const zac: Contributor = {
  nickname: 'zac',
  github: 'Zac-oihfdwrrtuinvbcp',
  discord: 'zac#4930',
  avatar: avatar('zac-avatar.png'),
};

export const HerzBlutRaffy: Contributor = {
  nickname: 'Raffy',
  github: 'naotaraffy',
  discord: 'HerzBlutRaffy#1697',
};

export const bdfreeman1421: Contributor = {
  nickname: 'bdfreeman1421',
  github: 'bdfreeman1421',
};
export const dodse: Contributor = {
  nickname: 'dodse',
  github: 'dsnam',
  discord: 'dsn#4942',
};
export const SyncSubaru: Contributor = {
  nickname: 'SyncSubaru',
  github: 'cameronstubber',
};
export const attluh: Contributor = {
  nickname: 'attluh',
  github: 'attluh',
  discord: 'attluh#3373',
};
export const Tenooki: Contributor = {
  nickname: 'Tenooki',
  github: 'awiss',
  discord: 'dubya#6711',
};
export const Elitesparkle: Contributor = {
  nickname: 'Elitesparkle',
  github: 'Elitesparkle',
};
export const Swolorno: Contributor = {
  nickname: 'Swolorno',
  github: 'skolldev',
  discord: 'Swolorno#3441',
  mains: [
    {
      name: 'Swolorno',
      spec: SPECS.MARKSMANSHIP_HUNTER,
      link: 'https://worldofwarcraft.com/en-gb/character/eu/twisting-nether/Swolorno',
    },
  ],
};
export const iTitou: Contributor = {
  nickname: 'iTitou',
  github: 'titouanc',
  mains: [
    {
      name: 'Fantomeuh',
      spec: SPECS.CLASSIC_DRUID_RESTORATION,
      link: 'https://classic.warcraftlogs.com/character/eu/sulfuron/fantomeuh',
    },
  ],
};
export const Jundarer: Contributor = {
  nickname: 'Jundarer',
  github: 'Jundarer',
  discord: 'Jundarer#7131',
  mains: [
    {
      name: 'Jundarer',
      spec: SPECS.BALANCE_DRUID,
      link: 'https://worldofwarcraft.blizzard.com/en-gb/character/eu/tarren-mill/Tunderer',
    },
  ],
};
export const Vollmer: Contributor = {
  nickname: 'Vollmer',
  github: 'Krealle',
  discord: 'Vollmerino#2637',
  avatar: avatar('Vollmer-avatar.png'),
  mains: [
    {
      name: 'Vollmer',
      spec: SPECS.DEVASTATION_EVOKER,
      link: 'https://worldofwarcraft.blizzard.com/en-gb/character/eu/ragnaros/Vollmer',
    },
  ],
};
export const Seriousnes: Contributor = {
  nickname: 'Seriousnes',
  github: 'Seriousnes',
  discord: 'seriousnes',
  avatar: avatar('seriousnes-avatar.png'),
  mains: [
    {
      name: 'Seriousnes',
      spec: SPECS.ENHANCEMENT_SHAMAN,
      link: 'https://worldofwarcraft.blizzard.com/en-us/character/us/frostmourne/Seriousnes',
    },
  ],
};

export const CodersKitchen: Contributor = {
  nickname: 'coders-kitchen',
  github: 'coders-kitchen',
};

export const Meldris: Contributor = {
  nickname: 'Meldris',
  github: 'Meldris',
};

export const Periodic: Contributor = {
  nickname: 'Periodic',
  github: 'Periodic',
  discord: 'periodic',
};

export const Awildfivreld: Contributor = {
  nickname: 'Awildfivreld',
  github: 'awildfivreld',
};

export const Tapir: Contributor = {
  nickname: 'Tapir',
  github: 'Tapir42',
  discord: 'Tapir#8523',
  mains: [
    {
      name: 'Tapriest',
      spec: SPECS.DISCIPLINE_PRIEST,
      link: 'https://worldofwarcraft.blizzard.com/en-gb/character/eu/sylvanas/tapriest',
    },
  ],
};

export const Melnais: Contributor = {
  nickname: 'Melnais',
  github: 'agrabovskis',
};

export const beckeeh: Contributor = {
  nickname: 'beckeeh',
  github: 'lavjamanxd',
  discord: 'beckeeh',
  mains: [
    {
      name: 'Beckeeh',
      spec: SPECS.SHADOW_PRIEST,
      link: 'https://classic.warcraftlogs.com/character/eu/nethergarde-keep/beckeeh',
    },
  ],
};
export const Whispyr: Contributor = {
  nickname: 'Whispyr',
  github: 'JannickMueller-Whispyr',
  discord: 'Whispyr#0001',
  avatar: avatar('Whispyr-avatar.png'),
};
export const Amelydia: Contributor = {
  nickname: 'Amelydia',
  github: 'kmains',
  mains: [
    {
      name: 'Amelydia',
      spec: SPECS.CLASSIC_DRUID_FERAL_COMBAT,
      link: 'https://classic.warcraftlogs.com/character/us/atiesh/Amelydia',
    },
  ],
};
export const Ypp: Contributor = {
  nickname: 'Ypp',
  github: 'brocolicosmique',
  avatar: avatar('Ypp-avatar.png'),
  mains: [
    {
      name: 'Ypp',
      spec: SPECS.RESTORATION_SHAMAN,
      link: 'https://www.warcraftlogs.com/character/id/58915319',
    },
  ],
};

export const Texleretour: Contributor = {
  nickname: 'Tex',
  github: 'Texleretour',
  discord: 'texleretour',
  avatar: avatar('Tex-avatar.jpg'),
};

export const LucasLevyOB: Contributor = {
  nickname: 'LucasLevyOB',
  github: 'LucasLevyOB',
};

export const Pants: Contributor = {
  nickname: 'Pants',
  github: 'Smetz42',
  discord: 'pants_of_silver',
};

export const dub: Contributor = {
  nickname: 'wes/dub',
  github: 'wtodom',
  discord: 'its_me_dub',
};

export const Earosselot: Contributor = {
  nickname: 'earosselot',
  github: 'earosselot',
  avatar: avatar('raistlinn-avatar.png'),
  mains: [
    {
      name: 'Raistlinn',
      spec: SPECS.FROST_MAGE,
      link: 'https://www.warcraftlogs.com/character/id/77062152',
    },
  ],
};

export const Zyer: Contributor = {
  nickname: 'Zyer',
  github: 'ZyerTCoder',
  discord: 'zyer',
  mains: [
    {
      name: 'Yumiblood',
      spec: SPECS.DEMONOLOGY_WARLOCK,
      link: 'https://www.warcraftlogs.com/character/id/42737929',
    },
  ],
};

export const Gazh: Contributor = {
  nickname: 'Gazh',
  github: 'gazhrot',
  discord: 'gazh_',
  mains: [
    {
      name: 'Meurthe',
      spec: SPECS.DEMONOLOGY_WARLOCK,
      link: 'https://www.warcraftlogs.com/character/eu/twisting-nether/meurthe',
    },
  ],
};

export const Humperella: Contributor = {
  nickname: 'Humperella',
  github: 'kevindqc',
  discord: '.darkvirus.',
  mains: [
    {
      name: 'Humperella',
      spec: SPECS.RETRIBUTION_PALADIN,
      link: 'https://worldofwarcraft.com/en-us/character/zuljin/Humperella',
    },
  ],
};

export const Saeldur: Contributor = {
  nickname: 'Saeldur',
  github: 'Saeldur',
  discord: 'saeldur',
};

export const ZiayaKens: Contributor = {
  nickname: 'Ziaya Kens',
  github: 'JordanKlaers',
  discord: 'EonWorm',
  mains: [
    {
      name: 'EonWorm',
      spec: SPECS.HOLY_PALADIN,
      link: 'https://www.warcraftlogs.com/character/id/72594250',
    },
  ],
};

export const Lspinheiro: Contributor = {
  nickname: 'Lspinheiro',
  github: 'lspinheiro',
  discord: 'lspinheiro',
  mains: [
    {
      name: 'Gromlash',
      spec: SPECS.RESTORATION_SHAMAN,
      link: 'https://worldofwarcraft.blizzard.com/en-us/character/us/khazgoroth/gromlash',
    },
  ],
};

export const Bhahlou: Contributor = {
  nickname: 'Bhahlou',
  github: 'Bhahlou',
  discord: 'Bhahlou',
};

export const Ethelis: Contributor = {
  nickname: 'Ethelis',
  github: 'ethelis',
};

export const Lithix: Contributor = {
  nickname: 'Lithix',
  github: 'Yitaarli',
  discord: 'lithix#0749',
};

export const Liavre: Contributor = {
  nickname: 'Liavre',
  github: 'Liavre',
  discord: 'Liavre',
};

export const Taevis: Contributor = {
  nickname: 'Taevis',
  github: 'JoeParrinello',
  discord: 'EdgeCas3',
  mains: [
    {
      name: 'Taevis',
      spec: SPECS.RETRIBUTION_PALADIN,
      link: 'https://worldofwarcraft.blizzard.com/en-us/character/us/destromath/taevis',
    },
  ],
};

export const SebShady: Contributor = {
  nickname: 'SebShady',
  github: 'SebShady42',
  discord: 'SebShady',
};

export const PandaGoesBaa: Contributor = {
  nickname: 'PandaGoesBaa',
  github: 'frankyi-gh',
  mains: [
    {
      name: 'PandaGoesBaa',
      spec: SPECS.RESTORATION_SHAMAN,
      link: 'https://worldofwarcraft.blizzard.com/en-us/character/us/illidan/pandagoesbaa',
    },
  ],
};

export const Quaarkz: Contributor = {
  nickname: 'Quaarkz',
  github: 'Quaarkz',
  discord: 'Quaarkz',
};
