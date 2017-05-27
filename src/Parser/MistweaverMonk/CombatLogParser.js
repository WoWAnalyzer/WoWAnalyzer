import React from 'react';

import MainCombatLogParser from 'Parser/Core/CombatLogParser';
import ParseResults from 'Parser/Core/ParseResults';
import getCastEfficiency from 'Parser/Core/getCastEfficiency';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
// import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
// import DarkmoonDeckPromises from 'Parser/Core/Modules/Items/DarkmoonDeckPromises';
// import AmalgamsSeventhSpine from 'Parser/Core/Modules/Items/AmalgamsSeventhSpine';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
// import Icon from 'common/Icon';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import ItemIcon from 'common/ItemIcon';

import StatisticBox from 'Main/StatisticBox';
import SuggestionsTab from 'Main/SuggestionsTab';
import TalentsTab from 'Main/TalentsTab';
import CastEfficiencyTab from 'Main/CastEfficiencyTab';
import CooldownsTab from 'Main/CooldownsTab';
import ManaTab from 'Main/ManaTab';

// Features
import CooldownTracker from './Modules/Features/CooldownTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import UpliftingTrance from './Modules/Features/UpliftingTrance';
import ManaTea from './Modules/Features/ManaTea';

// Setup for Items
import Velens from './Modules/Items/Velens';
import Prydaz from './Modules/Items/Prydaz';
import DrapeOfShame from './Modules/Items/DrapeOfShame';

import CPM_ABILITIES, { SPELL_CATEGORY } from './CPM_ABILITIES';

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
  static specModules = {
    // Override the ability tracker so we also get stats for IoL and beacon healing
    // abilityTracker: AbilityTracker,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownTracker: CooldownTracker,
    upliftingTrance: UpliftingTrance,
    manaTea: ManaTea,

    // Legendaries / Items:
    drapeOfShame: DrapeOfShame,
    prydaz: Prydaz,
    // sephuz: Sephuz,
    velens: Velens,

    // Shared:
    //amalgamsSeventhSpine: AmalgamsSeventhSpine,
    //darkmoonDeckPromises: DarkmoonDeckPromises,
  };

  generateResults() {
    const results = new ParseResults();

    const fightDuration = this.fightDuration;
    // const deadTimePercentage = this.modules.alwaysBeCasting.totalTimeWasted / fightDuration;

    const velensHealingPercentage = this.modules.velens.healing / this.totalHealing;
    const prydazHealingPercentage = this.modules.prydaz.healing / this.totalHealing;
    const drapeOfShameHealingPercentage = this.modules.drapeOfShame.healing / this.totalHealing;
    const unusedUTProcs = 1 - (this.modules.upliftingTrance.consumedUTProc / this.modules.upliftingTrance.UTProcsTotal);

    /*
    if (deadTimePercentage > 0.2) {
      results.addIssue({
        issue: `Your dead GCD time can be improved. Try to Always Be Casting (ABC); when there's nothing to heal try to contribute some damage (${Math.round(deadTimePercentage * 100)}% dead GCD time).`,
        icon: 'spell_mage_altertime',
        importance: getIssueImportance(deadTimePercentage, 0.35, 0.4, true),
      });
    }
    */



    if (this.modules.velens.active && velensHealingPercentage < 0.045) {
      results.addIssue({
        issue: <span>Your usage of <ItemLink id={ITEMS.VELENS_FUTURE_SIGHT.id} /> can be improved. Try to maximize the amount of casts during the buff or consider using an easier legendary ({(velensHealingPercentage * 100).toFixed(2)}% healing contributed).</span>,
        icon: ITEMS.VELENS_FUTURE_SIGHT.icon,
        importance: getIssueImportance(velensHealingPercentage, 0.04, 0.03),
      });
    }
    // Uplifting Trance Usage
    if (unusedUTProcs > 0.10) {
      results.addIssue({
        issue: <span>Your <a href="http://www.wowhead.com/spell=197206" target="_blank">Uplifting Trance</a> procs should be used as soon as you get them so they are not overwritten. You missed {(this.modules.upliftingTrance.UTProcsTotal - this.modules.upliftingTrance.consumedUTProc)}/{(this.modules.upliftingTrance.UTProcsTotal)} procs.</span>,
        icon: SPELLS.UPLIFTING_TRANCE_BUFF.icon,
        importance: getIssueImportance(unusedUTProcs, 0.2, 0.5, true),
      });
    }
    /* Removed per feedback from Garg on 6/24
    // Non-UT Buffed Vivify
    const vivify = this.modules.upliftingTrance.consumedUTProc + this.modules.upliftingTrance.nonUTVivify;
    const nonUTVivify = this.modules.upliftingTrance.nonUTVivify;
    if (nonUTVivify / vivify > 0) {
      results.addIssue({
        issue: <span><a href="http://www.wowhead.com/spell=116670" target="_blank">Vivify</a> is an inefficient spell to cast without <a href="http://www.wowhead.com/spell=197206" target="_blank">Uplifting Trance</a> procs.  You casted {nonUTVivify} Vivify's without the Uplifting Trance procc and {this.modules.upliftingTrance.tftVivCast} Vivfy's with the Thunder Focus Tea buff.</span>,
        icon: SPELLS.VIVIFY.icon,
        importance: getIssueImportance(nonUTVivify / vivify, 0.5, 0.25, true),
      });
    }*/
    // Mana Tea Usage issue
    if (this.modules.manaTea.active && (this.modules.manaTea.manaSaved / this.modules.manaTea.manateaCount) < 200000) {
      results.addIssue({
        issue: <span>Your mana spent during <a href="http://www.wowhead.com/spell=197908" target="_blank">Mana Tea</a> can be improved.  Always aim to cast your highest mana spells such as <a href="http://www.wowhead.com/spell=191837" target="_blank">Essence Font</a> or <a href="http://www.wowhead.com/spell=116670" target="_blank">Vivify</a>. ({((this.modules.manaTea.manaSaved / this.modules.manaTea.manateaCount) / 1000).toFixed(0)}k avg mana spent)</span>,
        icon: SPELLS.MANA_TEA_TALENT.icon,
        important: getIssueImportance((this.modules.manaTea.manaSaved / this.modules.manateaCount), 160000, 120000),
      })
    }

    const castEfficiencyCategories = SPELL_CATEGORY;
    const castEfficiency = getCastEfficiency(CPM_ABILITIES, this);
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
            src="./img/healing.png"
            style={{ border: 0 }}
            alt="Healing"
          />
        )}
        value={`${formatNumber(this.totalHealing / this.fightDuration * 1000)} HPS`}
        label={(
          <dfn data-tip={`The total healing done recorded was ${formatThousands(this.totalHealing)}.`}>
            Healing done
          </dfn>
        )}
      />,
      /*<StatisticBox
        icon={<Icon icon="petbattle_health-down" alt="Non healing time" />}
        value={`${formatPercentage(deadTimePercentage)} %`}
        label={(
          <dfn data-tip="Dead GCD time is available casting time not used. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/stunned), etc.">
            Dead GCD time
          </dfn>
        )}
      />,*/
      <StatisticBox
        icon={<SpellIcon id={SPELLS.UPLIFTING_TRANCE_BUFF.id} />}
        value={`${formatPercentage(unusedUTProcs)} %`}
        label={(
          <dfn data-tip={`You got total <b>${this.modules.upliftingTrance.UTProcsTotal} uplifting trance procs</b> and <b>used ${this.modules.upliftingTrance.consumedUTProc}</b> of them. ${this.modules.upliftingTrance.nonUTVivify} of your vivify's were used without an uplifting trance procs or without a Thunder Focus Tea buff.`}>
            Unused Uplifting Trance Pocs
          </dfn>
        )}
      />,
      this.modules.manaTea.active && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.MANA_TEA_TALENT.id} />}
          value={`${((this.modules.manaTea.manaSaved / this.modules.manaTea.manateaCount) / 1000).toFixed(0)}k mana`}
          label={(
            <dfn
              data-tip={`<ul>
                  During your ${this.modules.manaTea.manateaCount} <a href="http://www.wowhead.com/spell=197908" target="_blank">Mana Teas</a> saved the following mana:
                  ${this.modules.manaTea.efCasts > 0 ?
                  `<li>${(this.modules.manaTea.efCasts)} Essence Font casts</li>`
                  : ""
                  }
                  ${this.modules.manaTea.efCasts > 0 ?
                  `<li>${(this.modules.manaTea.vivCasts)} Vivfy casts</li>`
                  : ""
                  }
                  ${this.modules.manaTea.efCasts > 0 ?
                  `<li>${(this.modules.manaTea.enmCasts)} Enveloping Mists casts</li>`
                  : ""
                  }
                  <li>${(this.modules.manaTea.rjwCasts + this.modules.manaTea.revCasts + this.modules.manaTea.remCasts + this.modules.manaTea.lcCasts + this.modules.manaTea.effCasts)} other spells casted.</li>
                  <li>${(this.modules.manaTea.nonManaCasts)} non-mana casts during Mana Tea</li>
              </ul>`}
            >
              Average mana saved per Mana Tea
            </dfn>
          )}
        />
      ),
    ];

    results.items = [
      /*this.modules.prydaz.active && {
        id: ITEMS.PRYDAZ_XAVARICS_MAGNUM_OPUS.id,
        icon: <ItemIcon id={ITEMS.PRYDAZ_XAVARICS_MAGNUM_OPUS.id} />,
        title: <ItemLink id={ITEMS.PRYDAZ_XAVARICS_MAGNUM_OPUS.id} />,
        result: (
          <dfn data-tip="The actual effective healing contributed by the Prydaz, Xavaric's Magnum Opus equip effect.">
            {((prydazHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.prydaz.healing / fightDuration * 1000)} HPS
          </dfn>
        ),
      },*/

      this.modules.velens.active && {
        id: ITEMS.VELENS_FUTURE_SIGHT.id,
        icon: <ItemIcon id={ITEMS.VELENS_FUTURE_SIGHT.id} />,
        title: <ItemLink id={ITEMS.VELENS_FUTURE_SIGHT.id} />,
        result: (
          <dfn data-tip="The actual effective healing contributed by the Velen's Future Sight use effect.">
            {((velensHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.velens.healing / fightDuration * 1000)} HPS
          </dfn>
        ),
      },

      this.modules.prydaz.active && {
        id: ITEMS.PRYDAZ_XAVARICS_MAGNUM_OPUS.id,
        icon: <ItemIcon id={ITEMS.PRYDAZ_XAVARICS_MAGNUM_OPUS.id} />,
        title: <ItemLink id={ITEMS.PRYDAZ_XAVARICS_MAGNUM_OPUS.id} />,
        result: (
          <dfn data-tip="The actual effective healing contributed by the Prydaz, Xavaric's Magnum Opus equip effect.">
            {((prydazHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.prydaz.healing / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      this.modules.drapeOfShame.active && {
        id: ITEMS.DRAPE_OF_SHAME.id,
        icon: <ItemIcon id={ITEMS.DRAPE_OF_SHAME.id} />,
        title: <ItemLink id={ITEMS.DRAPE_OF_SHAME.id} />,
        result: (
          <dfn data-tip="The actual effective healing contributed by the Drape of Shame equip effect.">
            {((drapeOfShameHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.drapeOfShame.healing / fightDuration * 1000)} HPS
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
            cooldowns={this.modules.cooldownTracker.cooldowns}
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
