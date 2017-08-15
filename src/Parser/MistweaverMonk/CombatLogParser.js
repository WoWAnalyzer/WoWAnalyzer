// TODO:

import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import ITEMS from 'common/ITEMS';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';
import Mana from 'Main/Mana';
import MonkSpreadsheet from 'Main/MonkSpreadsheet';

import MainCombatLogParser from 'Parser/Core/CombatLogParser';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
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

// Talents
import ChiJi from './Modules/Talents/ChiJi';
import ChiBurst from './Modules/Talents/ChiBurst';
import ManaTea from './Modules/Talents/ManaTea';
import RefreshingJadeWind from './Modules/Talents/RefreshingJadeWind';
import Lifecycles from './Modules/Talents/Lifecycles';
import SpiritOfTheCrane from './Modules/Talents/SpiritOfTheCrane';

// Setup for Items
import Eithas from './Modules/Items/Eithas';
import T20_4pc from './Modules/Items/T20_4pc';
import T20_2pc from './Modules/Items/T20_2pc';
import ShelterOfRin from './Modules/Items/ShelterOfRin';
import DoorwayToNowhere from './Modules/Items/DoorwayToNowhere';
import PetrichorLagniappe from './Modules/Items/PetrichorLagniappe';
import OvydsWinterWrap from './Modules/Items/OvydsWinterWrap';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';

function formatThousands(number) {
  return (Math.round(number || 0) + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}
function formatNumber(number) {
  if (number > 1000000) {
    return `${(number / 1000000).toFixed(2)}m`;
  }
  if (number > 10000) {
    return `${Math.round(number / 1000)}k`;
  }
  return formatThousands(number);
}

function getIssueImportance(value, regular, major, higherIsWorse = false) {
  if (higherIsWorse ? value > major : value < major) {
    return ISSUE_IMPORTANCE.MAJOR;
  }
  if (higherIsWorse ? value > regular : value < regular) {
    return ISSUE_IMPORTANCE.REGULAR;
  }
  return ISSUE_IMPORTANCE.MINOR;
}
function formatPercentage(percentage) {
  return (Math.round((percentage || 0) * 10000) / 100).toFixed(2);
}

class CombatLogParser extends MainCombatLogParser {
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

  damageTaken = 0;
  on_toPlayer_damage(event){
    this.damageTaken += event.amount;
  }

  generateResults() {
    const results = super.generateResults();

    const fightDuration = this.fightDuration;
    const getPercentageOfTotal = healingDone => healingDone / this.totalHealing;
    const formatItemHealing = healingDone => `${formatPercentage(getPercentageOfTotal(healingDone))} % / ${formatNumber(healingDone / fightDuration * 1000)} HPS`;

    const abilityTracker = this.modules.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const t20_4pcHealingPercentage = this.modules.t20_4pc.healing / this.totalHealing;

    // Suggestions

    // Healing Suggestions

    // T20 2pc Buff missed
    if(this.modules.t20_2pc.active && (this.modules.t20_2pc.procs - this.modules.t20_2pc.casts) > 0) {
      results.addIssue({
        issue: <span>You missed {this.modules.t20_2pc.procs - this.modules.t20_2pc.casts} <SpellLink id={SPELLS.SURGE_OF_MISTS.id} /> procs. This proc provides not only a large mana savings on <SpellLink id={SPELLS.ENVELOPING_MISTS.id} />. If you have the Tier 20 4 piece bonus, you also gain a 12% healing buff through <SpellLink id={SPELLS.DANCE_OF_MISTS.id} /> </span>,
        icon: SPELLS.SURGE_OF_MISTS.icon,
        importance: getIssueImportance((this.modules.t20_2pc.procs - this.modules.t20_2pc.casts), 0, 1, true),
      });
    }

    results.statistics = [

      ...results.statistics,
    ];

    results.items = [
      ...results.items,
      this.modules.t20_4pc.active && {
        id: `spell-${SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF.id}`,
        icon: <SpellIcon id={SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF.id} />,
        title: <SpellLink id={SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF.id} />,
        result: (
          <dfn data-tip={`The actual effective healing contributed by the Tier 20 4 piece effect.<br />Buff Uptime: ${((this.selectedCombatant.getBuffUptime(SPELLS.DANCE_OF_MISTS.id)/this.fightDuration)*100).toFixed(2)}%`}>
            {((t20_4pcHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.t20_4pc.healing / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      this.modules.t20_2pc.active && {
        id: `spell-${SPELLS.XUENS_BATTLEGEAR_2_PIECE_BUFF.id}`,
        icon: <SpellIcon id={SPELLS.XUENS_BATTLEGEAR_2_PIECE_BUFF.id} />,
        title: <SpellLink id={SPELLS.XUENS_BATTLEGEAR_2_PIECE_BUFF.id} />,
        result: (
          <dfn data-tip={`The actual mana saved by the Tier 20 2 piece effect.`}>
            {formatNumber(this.modules.t20_2pc.manaSaved)} mana saved ({formatNumber((this.modules.t20_2pc.manaSaved / this.fightDuration * 1000 * 5))} MP5)
          </dfn>
        ),
      },
      this.modules.eithas.active && {
        item: ITEMS.EITHAS_LUNAR_GLIDES,
        result: formatItemHealing(this.modules.eithas.healing),
      },
      this.modules.shelterOfRin.active && {
        item: ITEMS.SHELTER_OF_RIN,
        result: formatItemHealing(this.modules.shelterOfRin.healing),
      },
      this.modules.doorwayToNowhere.active && {
        item: ITEMS.DOORWAY_TO_NOWHERE,
        result: formatItemHealing(this.modules.doorwayToNowhere.healing),
      },
      this.modules.ovydsWinterWrap.active && {
        item: ITEMS.OVYDS_WINTER_WRAP,
        result: formatItemHealing(this.modules.ovydsWinterWrap.healing),
      },
      this.modules.petrichorLagniappe.active && {
        item: ITEMS.PETRICHOR_LAGNIAPPE,
        result: (
          <dfn data-tip={`The wasted cooldown reduction from the legendary bracers. ${formatNumber((this.modules.petrichorLagniappe.wastedReductionTime / getAbility(SPELLS.REVIVAL.id).casts) / 1000)} seconds (Average wasted cooldown reduction per cast).`}>
            {formatNumber(this.modules.petrichorLagniappe.wastedReductionTime / 1000)} seconds wasted
          </dfn>
        ),
      },
    ];

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
      {
        title: 'Mana',
        url: 'mana',
        render: () => (
          <Tab title="Mana" style={{ padding: '15px 22px' }}>
            <Mana
              reportCode={this.report.code}
              actorId={this.playerId}
              start={this.fight.start_time}
              end={this.fight.end_time}
            />
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
      ...results.tabs,
    ];

    return results;
  }
}

export default CombatLogParser;
