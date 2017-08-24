// TODO:

import React from 'react';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';
import Mana from 'Main/Mana';
import MonkSpreadsheet from 'Main/MonkSpreadsheet';
import LowHealthHealing from 'Parser/Core/Modules/LowHealthHealing';

// Core
import HealingDone from './Modules/Core/HealingDone';

// Features
import CastEfficiency from './Modules/Features/CastEfficiency';
import CooldownTracker from './Modules/Features/CooldownTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import EssenceFontMastery from './Modules/Features/EssenceFontMastery';

// Traits
import MistsOfSheilun from './Modules/Traits/MistsOfSheilun';
import CelestialBreath from './Modules/Traits/CelestialBreath';
import WhispersOfShaohao from './Modules/Traits/WhispersOfShaohao';

// Spells
import UpliftingTrance from './Modules/Spells/UpliftingTrance';
import ThunderFocusTea from './Modules/Spells/ThunderFocusTea';
import SheilunsGift from './Modules/Spells/SheilunsGift';
import RenewingMist from './Modules/Spells/RenewingMist';
import EssenceFont from './Modules/Spells/EssenceFont';
import EnvelopingMists from './Modules/Spells/EnvelopingMists';
import SoothingMist from './Modules/Spells/SoothingMist';

// Talents
import ChiJi from './Modules/Talents/ChiJi';
import ChiBurst from './Modules/Talents/ChiBurst';
import ManaTea from './Modules/Talents/ManaTea';
import RefreshingJadeWind from './Modules/Talents/RefreshingJadeWind';
import Lifecycles from './Modules/Talents/Lifecycles';
import SpiritOfTheCrane from './Modules/Talents/SpiritOfTheCrane';

// Items
import Eithas from './Modules/Items/Eithas';
import T20_4pc from './Modules/Items/T20_4pc';
import T20_2pc from './Modules/Items/T20_2pc';
import ShelterOfRin from './Modules/Items/ShelterOfRin';
import DoorwayToNowhere from './Modules/Items/DoorwayToNowhere';
import PetrichorLagniappe from './Modules/Items/PetrichorLagniappe';
import OvydsWinterWrap from './Modules/Items/OvydsWinterWrap';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    // Core
    lowHealthHealing: LowHealthHealing,
    healingDone: HealingDone,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    castEfficiency: CastEfficiency,
    cooldownTracker: CooldownTracker,
    essenceFontMastery: EssenceFontMastery,

    // Traits
    mistsOfSheilun: MistsOfSheilun,
    celestialBreath: CelestialBreath,
    whispersOfShaohao: WhispersOfShaohao,

    // Spells
    essenceFont: EssenceFont,
    renewingMist: RenewingMist,
    sheilunsGift: SheilunsGift,
    thunderFocusTea: ThunderFocusTea,
    upliftingTrance: UpliftingTrance,
    envelopingMists: EnvelopingMists,
    soothingMist: SoothingMist,

    // Talents
    chiBurst: ChiBurst,
    chiJi: ChiJi,
    manaTea: ManaTea,
    refreshingJadeWind: RefreshingJadeWind,
    lifecycles: Lifecycles,
    spiritOfTheCrane: SpiritOfTheCrane,

    // Legendaries / Items:
    eithas: Eithas,
    t20_4pc: T20_4pc,
    t20_2pc: T20_2pc,
    shelterOfRin: ShelterOfRin,
    doorwayToNowhere: DoorwayToNowhere,
    petrichorLagniappe: PetrichorLagniappe,
    ovydsWinterWrap: OvydsWinterWrap,
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
            <Talents combatant={this.selectedCombatant} />
          </Tab>
        ),
      },
      ...results.tabs,
      {
        title: 'Mana',
        url: 'mana',
        render: () => (
          <Tab title="Mana" style={{ padding: '15px 22px' }}>
            <Mana parser={this} />
          </Tab>
        ),
      },
      {
        title: 'Player Log Data',
        url: 'player-log-data',
        render: () => (
          <Tab title="Player Log Data" style={{ padding: '15px 22px 15px 15px' }}>
            <MonkSpreadsheet parser={this} />
          </Tab>
        ),
      },
    ];
    return results;
  }
}

export default CombatLogParser;
