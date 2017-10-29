import React from 'react';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';
import Mana from 'Main/Mana';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import LowHealthHealing from 'Parser/Core/Modules/LowHealthHealing';
import HealingDone from 'Parser/Core/Modules/HealingDone';

import AtonementSuccessiveDamageNormalizer from './Normalizers/AtonementSuccessiveDamage';

import SpellManaCost from './Modules/Core/SpellManaCost';
import AbilityTracker from './Modules/Core/AbilityTracker';

import CastEfficiency from './Modules/Features/CastEfficiency';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownTracker from './Modules/Features/CooldownTracker';
import PowerWordShieldWasted from './Modules/Features/PowerWordShieldWasted';
import AtonementSource from './Modules/Features/AtonementSource';
import AtonementHealingDone from './Modules/Features/AtonementHealingDone';
import PowerWordBarrier from './Modules/Features/PowerWordBarrier';
import LeniencesReward from './Modules/Features/LeniencesReward';
import PurgeTheWicked from './Modules/Features/PurgeTheWicked';

import Tier19_2set from './Modules/Items/Tier19_2set';
import CordOfMaiev from './Modules/Items/CordOfMaiev';
import InnerHallation from './Modules/Items/InnerHallation';
import Skjoldr from './Modules/Items/Skjoldr';
import Xalan from './Modules/Items/Xalan';
import NeroBandOfPromises from './Modules/Items/NeroBandOfPromises';
import TarnishedSentinelMedallion from './Modules/Items/TarnishedSentinelMedallion';
import MarchOfTheLegion from './Modules/Items/MarchOfTheLegion';
import Tier20_2set from './Modules/Items/Tier20_2set';
import Tier20_4set from './Modules/Items/Tier20_4set';
import Estel from './Modules/Items/Estel';

import TwistOfFate from './Modules/Spells/TwistOfFate';
import Castigation from './Modules/Spells/Castigation';
import Atonement from './Modules/Spells/Atonement';
import Evangelism from './Modules/Spells/Evangelism';
import Penance from './Modules/Spells/Penance';
import TouchOfTheGrave from './Modules/Spells/TouchOfTheGrave';

import BorrowedTime from './Modules/Spells/Traits/BorrowedTime';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {

    // Normalizers
    atonementSuccessiveDamage: AtonementSuccessiveDamageNormalizer,

    healingDone: [HealingDone, { showStatistic: true }],

    // Override the ability tracker so we also get stats for IoL and beacon healing
    spellManaCost: SpellManaCost,
    abilityTracker: AbilityTracker,
    lowHealthHealing: LowHealthHealing,
    castEfficiency: CastEfficiency,

    // Abilities
    penance: Penance,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownTracker: CooldownTracker,
    powerWordShieldWasted: PowerWordShieldWasted,
    atonementSource: AtonementSource,
    atonementHealingDone: AtonementHealingDone,
    powerWordBarrier: PowerWordBarrier,
    leniencesReward: LeniencesReward,
    purgeTheWicked: PurgeTheWicked,

    // Items:
    tier19_2set: Tier19_2set,
    cordOfMaiev: CordOfMaiev,
    innerHallation: InnerHallation,
    skjoldr: Skjoldr,
    xalan: Xalan,
    neroBandOfPromises: NeroBandOfPromises,
    tarnishedSentinelMedallion: TarnishedSentinelMedallion,
    marchOfTheLegion: MarchOfTheLegion,
    tier20_2set: Tier20_2set,
    tier20_4set: Tier20_4set,
    estel: Estel,

    // Spells (talents and traits):
    twistOfFate: TwistOfFate,
    castigation: Castigation,
    atonement: Atonement,
    evangelism: Evangelism,
    touchOfTheGrave: TouchOfTheGrave,
    borrowedTime: BorrowedTime,
  };

  generateResults() {
    const results = super.generateResults();

    results.tabs = [
      {
        title: 'Suggestions',
        url: 'suggestions',
        render: () => (
          <SuggestionsTab issues={results.issues} />
        ),
      },
      {
        title: 'Talents',
        url: 'talents',
        render: () => (
          <Tab title="Talents">
            <Talents combatant={this.modules.combatants.selected} />
          </Tab>
        ),
      },
      {
        title: 'Mana',
        url: 'mana',
        render: () => (
          <Tab title="Mana" style={{ padding: '15px 22px' }}>
            <Mana parser={this} />
          </Tab>
        ),
      },
      ...results.tabs,
    ];

    return results;
  }
}

export default CombatLogParser;
