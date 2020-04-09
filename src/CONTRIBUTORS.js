/**
 * This contains a listing of all contributors. Entries are used in configs and changelogs.
 * Feel free to add yourself if you're not yet in the list.
 *
 * Using `require` for avatars so we don't have to keep a seperate list of imports disconnected from the maintainer definition.
 *
 EXAMPLE

 export const NICKNAME = {
    nickname: 'NICKNAME',
    github: 'GITHUB_NAME',
    discord: 'DISCORD_NAME INCL #xxxx',
    avatar: require('./images/IMAGE'),
    desc: 'DESC',
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

// For testing purposes because I am too lazy to work out a solution for testing that does not involve adding regular code
export const Dummy = {
  nickname: 'Dummy',
  github: 'DummyHub',
  twitter: '@Dummy',
  avatar: require('./interface/images/avatars/zerotorescue-avatar.png'),
};
export const Zerotorescue = {
  nickname: 'Zerotorescue',
  github: 'MartijnHols',
  twitter: 'Zerotorescue',
  discord: 'Zerotorescue#0724',
  avatar: require('./interface/images/avatars/zerotorescue-avatar.png'),
  desc: 'WoWAnalyzer founder, Holy Paladin theorycrafter',
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
export const blazyb = {
  nickname: 'blazyb',
  github: 'buimichael',
};
export const Qbz = {
  nickname: 'Qbz',
  github: 'Qbz23',
};
export const sref = {
  nickname: 'sref',
  github: 'kfinch',
  avatar: require('./interface/images/avatars/sref-avatar.png'),
};
export const Iskalla = {
  nickname: 'Iskalla',
  github: 'Iskalla',
  avatar: require('./interface/images/avatars/iskalla-avatar.png'),
};
export const enragednuke = {
  nickname: 'enragednuke',
  github: 'enragednuke',
};
export const Skamer = {
  nickname: 'Skamer',
  github: 'Skamer',
};
export const Salarissia = {
  nickname: 'Salarissia',
  github: 'Salarissia',
};
export const WOPR = {
  nickname: 'WOPR',
  github: 'shighman',
};
export const Yajinni = {
  nickname: 'Yajinni',
  github: 'yajinni',
};
export const Bonebasher = {
  nickname: 'Bonebasher',
};
export const Sharrq = {
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
export const Khazak = {
  nickname: 'Khazak',
  github: 'jjs451',
  avatar: require('./interface/images/avatars/khazak-avatar.png'),
  discord: 'Khazak#3360',
  mains: [{
    name: 'Khazakk',
    spec: SPECS.FROST_DEATH_KNIGHT,
    link: 'https://worldofwarcraft.com/en-us/character/us/stormrage/khazakk',
  }],
};
export const Bicepspump = {
  nickname: 'Bicepspump',
  github: 'Bicepspump',
};
export const Mamtooth = {
  nickname: 'Mamtooth',
  github: 'ronaldpereira',
  avatar: require('./interface/images/avatars/mamtooth-avatar.png'),
};
export const Thieseract = {
  nickname: 'Thieseract',
  github: 'Thieseract',
};
export const Putro = {
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
export const Blazballs = {
  nickname: 'Blazballs',
  github: 'leapis',
};
export const faide = {
  nickname: 'faide',
  github: 'FaideWW',
  avatar: require('./interface/images/avatars/faide-avatar.png'),
};
export const Fyruna = {
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
export const Anomoly = {
  nickname: 'Anomoly',
  github: 'anom0ly',
  avatar: require('./interface/images/avatars/anomoly-avatar.jpg'),
};
export const Juko8 = {
  nickname: 'Juko8',
  github: 'Juko8',
  avatar: require('./interface/images/avatars/juko8-avatar.jpg'),
};
export const Noichxd = {
  nickname: 'Noichxd',
  github: 'Noichxd',
};
export const Hewhosmites = {
  nickname: 'Hewhosmites',
  github: 'CollCrom',
  avatar: require('./interface/images/avatars/hewhosmites-avatar.png'),
};
export const Reglitch = {
  nickname: 'Reglitch',
  github: 'rp4rk',
};
export const Gao = {
  nickname: 'Gao',
  github: 'awlego',
};
export const Oratio = {
  nickname: 'Oratio',
  github: 'karlpralow',
};
export const hassebewlen = {
  nickname: 'hassebewlen',
  github: 'hasseboulen',
};
export const tsabo = {
  nickname: 'tsabo',
  github: 'TsaboTavok',
};
export const zealk = {
  nickname: 'zealk',
  github: 'zealk',
};
export const fasib = {
  nickname: 'fasib',
  github: 'fasib',
};
export const janvavra = {
  nickname: 'janvavra',
  github: 'janvavra',
};
export const Nighteyez07 = {
  nickname: 'Nighteyez07',
  github: 'Nighteyez07',
};
export const Versaya = {
  nickname: 'Versaya',
  github: 'versaya',
};
export const Chizu = {
  nickname: 'Chizu',
  github: 'sMteX',
  avatar: require('./interface/images/avatars/Chizu_avatar.jpg'),
};
export const Gwelican = {
  nickname: 'Gwelican',
  github: 'gwelican',
};
export const Hordehobbs = {
  nickname: 'Hordehobbs',
  github: 'hpabst',
};
export const TheBadBossy = {
  nickname: 'TheBadBossy',
  avatar: require('./interface/images/avatars/thebadbossy_avatar.jpg'),
};
export const JLassie82 = {
  nickname: 'JLassie82',
  github: 'JLassie82',
};
export const aryu = {
  nickname: 'aryu',
  github: 'Yuyz0112',
};
export const Dyspho = {
  nickname: 'Dyspho',
};
export const Gurupitka = {
  nickname: 'Gurupitka',
};
export const Hartra344 = {
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
export const strel = {
  nickname: 'strel',
};
export const Maldark = {
  nickname: 'Maldark',
  github: 'Maldark',
};
export const hatra344 = {
  nickname: 'hatra344',
  github: 'hatra344',
};
export const emallson = {
  nickname: 'emallson',
  github: 'emallson',
  avatar: require('./interface/images/avatars/emallson-avatar.jpg'),
};
export const Gebuz = {
  nickname: 'Gebuz',
  github: 'Gebuz',
  discord: 'Gebuz#5801',
  avatar: require('./interface/images/avatars/gebuz-avatar.png'),
  desc: 'Balance Druid theorycrafter and top end mythic raider.',
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
export const milesoldenburg = {
  nickname: 'milesoldenburg',
  github: 'milesoldenburg',
};
export const mwwscott0 = {
  nickname: 'mwwscott0',
  github: 'mwwscott0',
};
export const Talby = {
  nickname: 'Talby',
  github: 'Talby223',
};
export const Coryn = {
  nickname: 'Coryn',
  github: 'terndrup',
};
export const AttilioLH = {
  nickname: 'AttilioLH',
  github: 'AttilioLH',
};
export const poneria = {
  nickname: 'poneria',
  github: 'poneria',
};
export const Nekorsis = {
  nickname: 'Nekorsis',
  github: 'Nekorsis',
};
export const greatman = {
  nickname: 'greatman',
  github: 'greatman',
};
export const rubensayshi = {
  nickname: 'rubensayshi',
  github: 'rubensayshi',
};
export const nutspanther = {
  nickname: 'nutspanther',
  github: 'nutspanther',
};
export const Riglerr = {
  nickname: 'Riglerr',
  github: 'Riglerr',
};
export const BlokyKappa = {
  nickname: 'BlokyKappa',
  github: 'BlokyKappa',
};
export const kyleglick = {
  nickname: 'kyle-glick',
  github: 'kyle-glick',
};
export const Zeboot = {
  nickname: 'Zeboot',
  github: 'Zeboot',
  discord: 'Zeboot#0001',
  avatar: require('./interface/images/avatars/Zeboot-avatar.png'),
  mains: [
    {
      name: 'Zebeer',
      spec: SPECS.BREWMASTER_MONK,
      link: 'https://worldofwarcraft.com/en-us/character/us/whisperwind/zebeer',
    }, {
      name: 'Zeboot',
      spec: SPECS.GUARDIAN_DRUID,
      link: 'https://worldofwarcraft.com/en-us/character/us/whisperwind/zeboot',
    }],
    alts: [{
      name: 'Zelightsneak',
      spec: SPECS.ASSASSINATION_ROGUE,
      link: 'https://worldofwarcraft.com/en-us/character/us/whisperwind/zelightsneak',
    }],
};
export const HawkCorrigan = {
  nickname: 'HawkCorrigan',
  github: 'HawkCorrigan',
};
export const Vetyst = {
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
export const Anatta336 = {
  nickname: 'Anatta336',
  github: 'Anatta336',
  discord: 'Anatta#5878',
};
export const Herusx = {
  nickname: 'Herusx',
};
export const Scaleable = {
  nickname: 'Scaleable',
  github: 'wkrueger',
  avatar: require('./interface/images/avatars/scaleable-avatar.png'),
};
export const Cloake = {
  nickname: 'Cloake',
  github: 'adilasif',
  discord: 'Cloake#9930',
  mains: [{
    name: 'Trixx',
    spec: SPECS.ASSASSINATION_ROGUE,
    link: 'https://worldofwarcraft.com/en-us/character/kelthuzad/Trixx',
  }],
};
export const joshinator = {
  nickname: 'joshinator',
  github: 'joshinat0r',
  discord: 'joshinator#7267',
  mains: [{
    name: 'Êxtêndêd',
    spec: SPECS.BLOOD_DEATH_KNIGHT,
    link: 'https://worldofwarcraft.com/en-gb/character/eredar/Êxtêndêd',
  }],
};
export const niseko = {
  nickname: 'niseko',
  github: 'niseko',
  discord: 'niseko#4130',
  avatar: require('./interface/images/avatars/niseko-avatar.jpg'),
  mains: [{
    name: 'Niseko',
    spec: SPECS.RESTORATION_SHAMAN,
    link: 'https://worldofwarcraft.com/en-gb/character/stormscale/niseko',
  },
    {
      name: 'Nisefy',
      spec: SPECS.MISTWEAVER_MONK,
      link: 'https://worldofwarcraft.com/en-gb/character/stormscale/nisefy',
    }],
  links: {
    'Ancestral Guidance': 'https://ancestralguidance.com/',
  },
};
export const Aelexe = {
  nickname: 'Aelexe',
  github: 'Aelexe',
  avatar: require('./interface/images/avatars/Aelexe-avatar.jpg'),
  maintainer: [
    SPECS.ARMS_WARRIOR,
  ],
  mains: [{
    name: 'Aelexe',
    spec: SPECS.HOLY_PALADIN,
    link: 'https://worldofwarcraft.com/en-us/character/frostmourne/aelexe',
  }],
};
export const CubeLuke = {
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
export const ackwell = {
  nickname: 'ackwell',
  github: 'ackwell',
  discord: 'ackwell#3835',
  avatar: require('./interface/images/avatars/ackwell-avatar.png'),
};
export const regret = {
  nickname: 'regret',
  github: 'remyaraya',
  discord: "regret#8633",
  mains: [{
    name: 'Ratchrat',
    spec: SPECS.HOLY_PALADIN,
    link: 'https://worldofwarcraft.com/en-us/character/thrall/ratchrat',
  }],
};
export const Khadaj = {
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
export const fel1ne = {
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
export const Dambroda = {
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
export const Nalhan = {
  nickname: 'Nalhan',
  github: 'Nalhan',
  discord: 'rye bread#9105',
  mains: [{
    name: 'Doughmaker',
    spec: SPECS.DISCIPLINE_PRIEST,
    link: 'http://us.battle.net/wow/character/arthas/Doughmaker',
  }],
};
export const Satyric = {
  nickname: 'Satyric',
  github: 'kujan',
  discord: 'Satyric#9107',
  mains: [{
    name: 'Satyric',
    spec: SPECS.HOLY_PALADIN,
    link: 'https://worldofwarcraft.com/en-gb/character/ragnaros/Satyric',
  }],
};
export const jos3p = {
  nickname: 'jos3p',
  github: 'jos3p',
  discord: 'jos3p#9746',
};
export const Matardarix = {
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
export const mtblanton = {
  nickname: 'mtblanton',
  github: 'mtblanton',
  mains: [{
    name: 'Harzwaz',
    spec: SPECS.ENHANCEMENT_SHAMAN,
    link: 'https://worldofwarcraft.com/en-us/character/turalyon/Harzwaz',
  }],
};
export const Streammz = {
  nickname: 'Streammz',
  github: 'Streammz',
  discord: 'Streammz#9999',
};
export const Eylwen = {
  nickname: 'Eylwen',
  github: 'Alastair-Scott',
  discord: 'Eylwen#0287',
};
export const Korebian = {
  nickname: 'Korebian',
  github: 'Asamsig',
};
export const _4Ply = {
  nickname: '4Ply',
  github: '4Ply',
  discord: '4Ply#9270',
  mains: [{
    name: 'Uzdrowiciela',
    spec: SPECS.RESTORATION_DRUID,
    link: 'https://worldofwarcraft.com/en-gb/character/sylvanas/Uzdrowiciela',
  }],
};
export const Dorixius = {
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
export const Skeletor = {
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
export const Abelito75 = {
  nickname: 'Abelito75',
  github: 'abelito75',
  avatar: require('./interface/images/avatars/Abelito75-avatar.png'),
  desc: 'MW Vet in Peak of Serenity discord, MW Theorycrafter',
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
export const HolySchmidt = {
  nickname: 'HolySchmidt',
  github: '5chmidt',
  avatar: require('./interface/images/avatars/holyschmidt-avatar.jpg'),
  desc: 'Holy Paladin, Tinkerer',
  mains: [{
    name: 'HolySchmidt',
    spec: SPECS.HOLY_PALADIN,
    link: 'https://worldofwarcraft.com/en-us/character/us/whisperwind/holyschmidt',
  }],
};
export const Coywolf = {
  nickname: 'Coywolf',
  github: 'Coywolf',
  discord: 'Coywolf#3500',
  mains: [{
    name: 'Coywolf',
    spec: SPECS.OUTLAW_ROGUE,
    link: 'https://worldofwarcraft.com/en-us/character/us/arthas/coywolf',
  }],
};
export const Scotsoo = {
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
export const LeoZhekov = {
  nickname: 'LeoZhekov',
  github: 'LeoZhekov',
  discord: 'LeoZhekov#6641',
  avatar: require('./interface/images/avatars/LeoZhekov-avatar.jpg'),
  mains: [{
    name: 'Lisossa',
    spec: SPECS.SURVIVAL_HUNTER,
    link: 'https://worldofwarcraft.com/en-gb/character/Zenedar/Lisossa',
  }],
};
export const Amrux = {
  nickname: 'Amrux',
  github: 'grantjoshua1995',
};
export const Viridis = {
  nickname: 'Viridis',
  github: 'viridis',
  discord: 'Viridis#2748',
};
export const Wing5wong = {
  nickname: 'wing5wong',
  github: 'wing5wong',
  mains: [{
    name: 'Shrom',
    spec: SPECS.BALANCE_DRUID,
    link: 'https://worldofwarcraft.com/en-us/character/us/frostmourne/shrom',
  }],
};
export const Draenal = {
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
export const Adoraci = {
  nickname: 'Adoraci',
  github: 'DylanDirlam',
  discord: 'Adoraci#0001',
  avatar: require('./interface/images/avatars/Adoraci-avatar.png'),
  mains: [{
    name: 'Adoraci',
    spec: SPECS.DISCIPLINE_PRIEST,
    link: 'https://worldofwarcraft.com/en-us/character/us/zuljin/adoraci',
  }],
};
export const TheJigglr = {
  nickname: 'TheJigglr',
  github: 'myran2',
  discord: 'Henry#4712',
  mains: [{
    name: 'Thejigglr',
    spec: SPECS.ELEMENTAL_SHAMAN,
    link: 'https://worldofwarcraft.com/en-us/character/us/bleeding-hollow/thejigglr',
  }],
};
export const fluffels = {
  nickname: 'fluffels',
  github: 'fluffels',
  discord: 'fluffels#4322',
  main: [{
    name: 'Micheladaw',
    spec: SPECS.AFFLICTION_WARLOCK,
    link: 'https://worldofwarcraft.com/en-gb/character/eu/draenor/micheladaw',
  }],
};
export const JeremyDwayne = {
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
export const Taleria = {
  nickname: 'Taleria',
  github: 'bramdevries',
  avatar: require('./interface/images/avatars/taleria-avatar.png'),
  mains: [{
    name: 'Taleria',
    spec: SPECS.HOLY_PALADIN,
    link: 'https://worldofwarcraft.com/en-gb/character/eu/eonar/Taleria',
  }],
};
export const axelkic = {
  nickname: 'axelkic',
  github: 'axelkic',
};
export const soloxcx = {
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
export const Torothin = {
  nickname: 'Brad',
  github: 'Torothin',
  discord: 'Torothin#9751',
};
export const layday = {
  nickname: 'layday',
  github: 'layday',
};
export const FraunchToost = {
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
