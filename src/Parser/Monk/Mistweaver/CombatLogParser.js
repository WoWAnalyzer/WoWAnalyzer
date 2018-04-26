import React from 'react';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import Tab from 'Main/Tab';
import MonkSpreadsheet from 'Main/MonkSpreadsheet';
import LowHealthHealing from 'Parser/Core/Modules/LowHealthHealing';
import HealingDone from 'Parser/Core/Modules/HealingDone';

import GlobalCooldown from './Modules/Core/GlobalCooldown';
import Channeling from './Modules/Core/Channeling';

// Features
import Abilities from './Modules/Features/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import EssenceFontMastery from './Modules/Features/EssenceFontMastery';
import Checklist from './Modules/Features/Checklist';
import StatValues from './Modules/Features/StatValues';

// Traits
import MistsOfSheilun from './Modules/Traits/MistsOfSheilun';
import CelestialBreath from './Modules/Traits/CelestialBreath';
import WhispersOfShaohao from './Modules/Traits/WhispersOfShaohao';
import CoalescingMists from './Modules/Traits/CoalescingMists';
import SoothingRemedies from './Modules/Traits/SoothingRemedies';
import EssenceOfTheMist from './Modules/Traits/EssenceOfTheMist';
import WayOfTheMistweaver from './Modules/Traits/WayOfTheMistweaver';
import InfusionOfLife from './Modules/Traits/InfusionOfLife';
import ProtectionOfShaohao from './Modules/Traits/ProtectionOfShaohao';
import ExtendedHealing from './Modules/Traits/ExtendedHealing';
import RelicTraits from './Modules/Traits/RelicTraits';

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
import DrapeOfShame from './Modules/Items/DrapeOfShame';
import Eithas from './Modules/Items/Eithas';
import T20_4set from './Modules/Items/T20_4set';
import T20_2set from './Modules/Items/T20_2set';
import ShelterOfRin from './Modules/Items/ShelterOfRin';
import DoorwayToNowhere from './Modules/Items/DoorwayToNowhere';
import PetrichorLagniappe from './Modules/Items/PetrichorLagniappe';
import OvydsWinterWrap from './Modules/Items/OvydsWinterWrap';
import T21_2set from './Modules/Items/T21_2set';
import T21_4set from './Modules/Items/T21_4set';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    // Core
    lowHealthHealing: LowHealthHealing,
    healingDone: [HealingDone, { showStatistic: true }],
    channeling: Channeling,
    globalCooldown: GlobalCooldown,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    essenceFontMastery: EssenceFontMastery,
    checklist: Checklist,
    statValues: StatValues,

    // Traits
    mistsOfSheilun: MistsOfSheilun,
    celestialBreath: CelestialBreath,
    whispersOfShaohao: WhispersOfShaohao,
    coalescingMists: CoalescingMists,
    soothingRemedies: SoothingRemedies,
    essenceOfTheMist: EssenceOfTheMist,
    wayOfTheMistweaver: WayOfTheMistweaver,
    infusionOfLife: InfusionOfLife,
    protectionOfShaohao: ProtectionOfShaohao,
    extendedHealing: ExtendedHealing,
    relicTraits: RelicTraits,

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
    drapeOfShame: DrapeOfShame,
    eithas: Eithas,
    t20_4set: T20_4set,
    t20_2set: T20_2set,
    shelterOfRin: ShelterOfRin,
    doorwayToNowhere: DoorwayToNowhere,
    petrichorLagniappe: PetrichorLagniappe,
    ovydsWinterWrap: OvydsWinterWrap,
    t21_2set: T21_2set,
    t21_4set: T21_4set,
  };

  generateResults() {
    const results = super.generateResults();

    results.tabs = [
      ...results.tabs,
      {
        title: 'Player Log Data',
        url: 'player-log-data',
        render: () => (
          <Tab style={{ padding: '15px 22px 15px 15px' }}>
            <MonkSpreadsheet parser={this} />
          </Tab>
        ),
      },
    ];
    return results;
  }
}

export default CombatLogParser;
