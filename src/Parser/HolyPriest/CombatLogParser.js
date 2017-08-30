import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Icon from 'common/Icon';
import ITEMS from 'common/ITEMS';

import StatisticBox from 'Main/StatisticBox';
import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';
import Mana from 'Main/Mana';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import LowHealthHealing from 'Parser/Core/Modules/LowHealthHealing';

import SpellManaCost from './Modules/Core/SpellManaCost';

// Spell data
import PrayerOfMending from './Modules/Spells/PrayerOfMending';
import DivineHymn from './Modules/Spells/DivineHymn';
import Sanctify from './Modules/Spells/Sanctify';

// Features
import CastEfficiency from './Modules/Features/CastEfficiency';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownTracker from './Modules/Features/CooldownTracker';
import RenewTheFaith from './Modules/Features/RenewTheFaith';
import Divinity from './Modules/Features/Divinity';
import LightOfTuure from './Modules/Features/LightOfTuure';
import EnduringRenewal from './Modules/Features/EnduringRenewal';

// Items
import TrousersOfAnjuna from './Modules/Items/TrousersOfAnjuna';
import XanshiCloak from './Modules/Items/XanshiCloak';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';

// Imports that will likely be used in the future but currently unused (go away npm warnings)
// import ItemLink from 'common/ItemLink';
// import PlayerBreakdownTab from 'Main/PlayerBreakdownTab';

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

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    spellManaCost: SpellManaCost,
    castEfficiency: CastEfficiency,
    lowHealthHealing: LowHealthHealing,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownTracker: CooldownTracker,
    renewTheFaith: RenewTheFaith,
    divinity: Divinity,
    lightOfTuure: LightOfTuure,
    enduringRenewal: EnduringRenewal,

    // Spells
    prayerOfMending: PrayerOfMending,
    divineHymn: DivineHymn,
    sanctify: Sanctify,

    // Items
    trousersOfAnjuna: TrousersOfAnjuna,
    xanshiCloak: XanshiCloak,
  };

  generateResults() {
    const results = super.generateResults();

    const fightDuration = this.fightDuration;
    const deadTimePercentage = this.modules.alwaysBeCasting.totalTimeWasted / fightDuration;
    const nonHealingTimePercentage = this.modules.alwaysBeCasting.totalHealingTimeWasted / fightDuration;

    const abilityTracker = this.modules.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    // Missed Hymn ticks calculations
    const missedHymnTicks = (getAbility(SPELLS.DIVINE_HYMN_CAST.id).casts * 5) - this.modules.divineHymn.ticks;

    // Leggo Legs vars
    const legsPercHPS = formatPercentage(this.getPercentageOfTotalHealingDone(this.modules.trousersOfAnjuna.healing));
    const legsHPS = formatNumber(this.modules.trousersOfAnjuna.healing / this.fightDuration * 1000);

    // Leggo cloak (Xan'shi) vars
    const cloakPercHPS = formatPercentage(this.getPercentageOfTotalHealingDone(this.modules.xanshiCloak.healing));
    const cloakHPS = formatNumber(this.modules.xanshiCloak.healing / this.fightDuration * 1000);

    // Light of T'uure vars
    const lotSpellHealing = formatNumber(this.modules.lightOfTuure.spellHealing);
    const lotBuffHealing = formatNumber(this.modules.lightOfTuure.buffHealing);
    const lotTotal = this.modules.lightOfTuure.spellHealing + this.modules.lightOfTuure.buffHealing;
    const lotPercHPS = formatPercentage(this.getPercentageOfTotalHealingDone(lotTotal));
    const lotHPS = formatNumber(lotTotal / this.fightDuration * 1000);

    if (deadTimePercentage > 0.05) {
      results.addIssue({
        issue: `Your dead GCD time can be improved. Try to Always Be Casting (ABC); when there's nothing to heal try to contribute some damage (${Math.round(deadTimePercentage * 100)}% dead GCD time).`,
        icon: 'spell_mage_altertime',
        importance: getIssueImportance(deadTimePercentage, 0.20, 1, true),
      });
    }

    // Because Holy Priest can gain a large amount of benefit from chain casting Heal even during downtime (for Serendipity or Blessing of T'uure procs)
    // it is very important to have a lower wasted healing time than most classes. The exception to this is when healers should be DPSing.
    if (nonHealingTimePercentage > 0.2) {
      results.addIssue({
        issue: <span>Your non healing time can be improved. Try to cast heals more regularly ({Math.round(nonHealingTimePercentage * 100)}% non healing time). If there is downtime, try casting <SpellLink id={SPELLS.GREATER_HEAL.id} /> to proc <SpellLink id={SPELLS.BLESSING_OF_TUURE_BUFF.id} />.</span>,
        icon: 'petbattle_health-down',
        importance: getIssueImportance(nonHealingTimePercentage, 0.3, 0.4, true),
      });
    }

    // This is usually caused by clipping the end of your Hymn on accident, or when you use Hymn right before a mechanic that requires you to move or displaces you. This should always be 0.
    if (missedHymnTicks > 0) {
      results.addIssue({
        issue: <span>You wasted {missedHymnTicks} <SpellLink id={SPELLS.DIVINE_HYMN_CAST.id} /> tick(s). Try to avoid clipping the end of Divine Hymn, as well timing it such that you will not have to move for its duration.</span>,
        icon: 'spell_holy_divinehymn',
        importance: getIssueImportance(missedHymnTicks, 0, 0, true),
      });
    }

    results.statistics = [
      <StatisticBox
        icon={(
          <img
            src="/img/healing.png"
            style={{ border: 0 }}
            alt="Healing"
          />)}
        value={`${formatNumber(this.modules.healingDone.total.effective / fightDuration * 1000)} HPS`}
        label={(
          <dfn data-tip={`The total healing done recorded was ${formatThousands(this.modules.healingDone.total.effective)}.`}>
            Healing done
          </dfn>
        )}
      />,
      <StatisticBox
        icon={<Icon icon="petbattle_health-down" alt="Non healing time" />}
        value={`${formatPercentage(deadTimePercentage)} %`}
        label={(
          <dfn data-tip="Dead GCD time is available casting time not used. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/stunned), etc.">
            Dead GCD time
          </dfn>
        )}
      />,
      this.modules.lightOfTuure.active && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.LIGHT_OF_TUURE_TRAIT.id} />}
          value={`${formatNumber(lotTotal)}`}
          label={(
            <dfn data-tip={`The benefit from both Light of T'uure casts and additional casts on targets with the buff. ${lotSpellHealing} from the spell itself and ${lotBuffHealing} from the buff it provides. This was ${lotPercHPS}% / ${lotHPS} of your total healing.`}>
              Light of Tuure
            </dfn>
          )}
        />
      ),
      ...results.statistics,
    ];

    results.items = [
      ...results.items,
      this.modules.trousersOfAnjuna.active && {
        item: ITEMS.ENTRANCING_TROUSERS_OF_ANJUNA,
        result: (
          <span>
            { legsPercHPS } % / { legsHPS } HPS
          </span>
        ),
      },
      this.modules.xanshiCloak.active && {
        item: ITEMS.XANSHI_CLOAK,
        result: (
          <dfn data-tip="Value of spells cast during the cloak's buff. Does not assume all healing after cloak ends would be a result of the cloak.">
            { cloakPercHPS } % / { cloakHPS } HPS / { formatNumber(this.modules.xanshiCloak.manaSaved) } mana saved
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
