import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Icon from 'common/Icon';
import ITEMS from 'common/ITEMS';

import StatisticBox from 'Main/StatisticBox';
import SuggestionsTab from 'Main/SuggestionsTab';
import TalentsTab from 'Main/TalentsTab';
import CastEfficiencyTab from 'Main/CastEfficiencyTab';
import CooldownsTab from 'Main/CooldownsTab';
import ManaTab from 'Main/ManaTab';
import LowHealthHealingTab from 'Main/LowHealthHealingTab';

import MainCombatLogParser from 'Parser/Core/CombatLogParser';
import getCastEfficiency from 'Parser/Core/getCastEfficiency';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

import AbilityTracker from './Modules/Core/AbilityTracker';

// Spell data
import PrayerOfMending from './Modules/Spells/PrayerOfMending';
import DivineHymn from './Modules/Spells/DivineHymn';
import Sanctify from './Modules/Spells/Sanctify';

// Features
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownTracker from './Modules/Features/CooldownTracker';
import RenewTheFaith from './Modules/Features/RenewTheFaith';
import Divinity from './Modules/Features/Divinity';
import LightOfTuure from './Modules/Features/LightOfTuure';
import EnduringRenewal from './Modules/Features/EnduringRenewal';

// Items
import TrousersOfAnjuna from './Modules/Items/TrousersOfAnjuna';
import XanshiCloak from './Modules/Items/XanshiCloak';

import CPM_ABILITIES, { SPELL_CATEGORY } from './CPM_ABILITIES';
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

class CombatLogParser extends MainCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    abilityTracker: AbilityTracker,

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

    const castEfficiencyCategories = SPELL_CATEGORY;
    const castEfficiency = getCastEfficiency(CPM_ABILITIES, this);

    // Renew the Faith trait data calculations
    const rtfPercHPS = formatPercentage(this.modules.renewTheFaith.healing / this.totalHealing);
    const rtfPercOH = formatPercentage(this.modules.renewTheFaith.overhealing / (this.modules.renewTheFaith.healing + this.modules.renewTheFaith.overhealing));
    const rtfRelPercHPS = formatPercentage(this.modules.renewTheFaith.healing / this.modules.divineHymn.healing);

    // Say Your Prayers trait data calculations / vars
    const sypTrait = this.selectedCombatant.traitsBySpellId[SPELLS.SAY_YOUR_PRAYERS_TRAIT.id];
    const percPomIncFromSYP = ((1 + (sypTrait * SPELLS.SAY_YOUR_PRAYERS_TRAIT.coeff)) / (1 - (sypTrait * SPELLS.SAY_YOUR_PRAYERS_TRAIT.coeff))) - 1;
    const sypValue = this.modules.prayerOfMending.healing * percPomIncFromSYP / (1 + percPomIncFromSYP);
    const sypHPS = sypValue / this.fightDuration * 1000;
    const sypPercHPSOverall = formatPercentage(sypValue / this.totalHealing);
    const sypPercHPSPoM = formatPercentage(sypValue / this.modules.prayerOfMending.healing);

    // Missed Hymn ticks calculations
    const missedHymnTicks = (getAbility(SPELLS.DIVINE_HYMN_CAST.id).casts * 5) - this.modules.divineHymn.ticks;

    // Leggo Legs vars
    const legsPercHPS = formatPercentage(this.modules.trousersOfAnjuna.healing / this.totalHealing);
    const legsHPS = formatNumber(this.modules.trousersOfAnjuna.healing / this.fightDuration * 1000);

    // Leggo cloak (Xan'shi) vars
    const cloakPercHPS = formatPercentage(this.modules.xanshiCloak.healing / this.totalHealing);
    const cloakHPS = formatNumber(this.modules.xanshiCloak.healing / this.fightDuration * 1000);

    // Light of T'uure vars
    const lotSpellHealing = formatNumber(this.modules.lightOfTuure.spellHealing);
    const lotBuffHealing = formatNumber(this.modules.lightOfTuure.buffHealing);
    const lotTotal = this.modules.lightOfTuure.spellHealing + this.modules.lightOfTuure.buffHealing;
    const lotPercHPS = formatPercentage(lotTotal / this.totalHealing);
    const lotHPS = formatNumber(lotTotal / this.fightDuration * 1000);

    // Enduring Renewal vars
    const erPercHPS = formatPercentage(this.modules.enduringRenewal.healing / this.totalHealing);
    const erHPS = formatNumber(this.modules.enduringRenewal.healing / this.fightDuration * 1000);
    const erGainPerRefresh = Math.round(this.modules.enduringRenewal.secsGained / this.modules.enduringRenewal.refreshedRenews * 100) / 100;

    // Sanctify efficiency vars
    const sancAvgHits = this.modules.sanctify.hits / this.modules.sanctify.casts;
    const sancMissedHits = (this.modules.sanctify.casts * 6) - this.modules.sanctify.hits;

    if (deadTimePercentage > 0.05) {
      results.addIssue({
        issue: `Your dead GCD time can be improved. Try to Always Be Casting (ABC); when there's nothing to heal try to contribute some damage (${Math.round(deadTimePercentage * 100)}% dead GCD time).`,
        icon: 'spell_mage_altertime',
        importance: getIssueImportance(deadTimePercentage, 0.20, 0.35, true),
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

    castEfficiency.forEach((cpm) => {
      if (cpm.canBeImproved && !cpm.ability.noSuggestion) {
        results.addIssue({
          issue: <span>Try to cast <SpellLink id={cpm.ability.spell.id} /> more often ({cpm.casts}/{cpm.maxCasts} casts: {Math.round(cpm.castEfficiency * 100)}% cast efficiency). {cpm.ability.extraSuggestion || ''}</span>,
          icon: cpm.ability.spell.icon,
          importance: cpm.ability.importance || getIssueImportance(cpm.castEfficiency, cpm.recommendedCastEfficiency - 0.05, cpm.recommendedCastEfficiency - 0.15),
        });
      }
    });

    results.statistics = [
      <StatisticBox
        icon={(
          <img
            src="/img/healing.png"
            style={{ border: 0 }}
            alt="Healing"
          />)}
        value={`${formatNumber(this.totalHealing / fightDuration * 1000)} HPS`}
        label={(
          <dfn data-tip={`The total healing done recorded was ${formatThousands(this.totalHealing)}.`}>
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
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PRAYER_OF_MENDING_CAST.id} />}
        value={`${formatNumber(sypHPS)} HPS`}
        label={(
          <dfn data-tip={`Approximation of Say Your Prayers' value by viewing average stacks per PoM cast (does not include Benediction renews). This is ${sypPercHPSOverall}% of your healing and ±${sypPercHPSPoM}% of your Prayer of Mending healing.`}>
            Say Your Prayers
          </dfn>
        )}
      />,
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HOLY_WORD_SANCTIFY.id} />}
        value={`${sancAvgHits.toFixed(2)}`}
        label={(
          <dfn data-tip={`A measure of how many targets were effectively healed by your Holy Word: Sanctify. Over 80% overhealing on a hit is considered a "miss". You missed ${sancMissedHits} of ${this.modules.sanctify.casts * 6} potential hits.`}>
            Average Sanctify hits
          </dfn>
        )}
      />,
      this.modules.divinity.active && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.DIVINITY_TALENT.id} />}
          value={`${((this.selectedCombatant.getBuffUptime(SPELLS.DIVINITY_BUFF.id)/this.fightDuration)*100).toFixed(1)} %`}
          label={(
            <dfn data-tip={`The effective healing contributed by Divinity was ${formatThousands(this.modules.divinity.healing)} / ${formatPercentage(this.modules.divinity.healing / this.totalHealing)} % / ${formatNumber(this.modules.divinity.healing / fightDuration * 1000)} HPS.`}>
              Divinity uptime
            </dfn>
          )}
        />
      ),
      this.modules.enduringRenewal.active && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.ENDURING_RENEWAL_TALENT.id} />}
          value={`${erHPS} HPS`}
          label={(
            <dfn data-tip={`
              Healing done on targets as a result of Enduring Renewal's refresh.
              This did ${formatNumber(this.modules.enduringRenewal.healing)} healing and was ${erPercHPS}% of your total healing.
              <br/><br/>
              You refreshed renews ${this.modules.enduringRenewal.refreshedRenews} times for a total of ${formatNumber(this.modules.enduringRenewal.secsGained)} additional seconds of Renew.
              (+${erGainPerRefresh}s per refresh on average).
            `}>
              Enduring Renewal
            </dfn>
          )}
        />
      ),
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
      this.modules.renewTheFaith.active && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.DIVINE_HYMN_CAST.id} />}
          value={`${formatNumber(this.modules.renewTheFaith.healing)}`}
          label={(
            <dfn data-tip={`Benefit gained from Renew the Faith (does not include Benediction renews). Assumes that every Divine Hymn cast is fully channeled. This was ${rtfPercHPS}% of your healing, had ${rtfPercOH}% overhealing and increased your Divine Hymn healing by ${rtfRelPercHPS}%`}>
              Renew the Faith
            </dfn>
          )}
        />
      ),

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
        title: 'Cast efficiency',
        url: 'cast-efficiency',
        render: () => (
          <CastEfficiencyTab
            categories={castEfficiencyCategories}
            abilities={castEfficiency}
          />
        ),
      },
      {
        title: 'Cooldowns',
        url: 'cooldowns',
        render: () => (
          <CooldownsTab
            fightStart={this.fight.start_time}
            fightEnd={this.fight.end_time}
            cooldowns={this.modules.cooldownTracker.pastCooldowns}
          />
        ),
      },
      {
        title: 'Talents',
        url: 'talents',
        render: () => (
          <TalentsTab combatant={this.selectedCombatant} />
        ),
      },
      {
        title: 'Low health healing',
        url: 'low-health-healing',
        render: () => (
          <LowHealthHealingTab parser={this} />
        ),
      },
      {
        title: 'Mana',
        url: 'mana',
        render: () => (
          <ManaTab
            reportCode={this.report.code}
            actorId={this.playerId}
            start={this.fight.start_time}
            end={this.fight.end_time}
          />
        ),
      },
    ];

    return results;
  }
}

export default CombatLogParser;
