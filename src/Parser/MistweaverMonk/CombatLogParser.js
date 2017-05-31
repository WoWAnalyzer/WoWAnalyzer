import React from 'react';

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

import MainCombatLogParser from 'Parser/Core/CombatLogParser';
import ParseResults from 'Parser/Core/ParseResults';
import getCastEfficiency from 'Parser/Core/getCastEfficiency';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
// import DarkmoonDeckPromises from 'Parser/Core/Modules/Items/DarkmoonDeckPromises';
// import AmalgamsSeventhSpine from 'Parser/Core/Modules/Items/AmalgamsSeventhSpine';
import Prydaz from 'Parser/Core/Modules/Items/Prydaz';

// Features
import CooldownTracker from './Modules/Features/CooldownTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import UpliftingTrance from './Modules/Features/UpliftingTrance';
import ManaTea from './Modules/Features/ManaTea';
import ManaSavingTalents from './Modules/Features/ManaSavingTalents';
import ThunderFocusTea from './Modules/Features/ThunderFocusTea';
import SheilunsGift from './Modules/Features/SheilunsGift';
import RenewingMist from './Modules/Features/RenewingMist';
import AOEHealingTracker from './Modules/Features/AOEHealingTracker';

// Setup for Items
import Velens from './Modules/Items/Velens';
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
    abilityTracker: AbilityTracker,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownTracker: CooldownTracker,
    upliftingTrance: UpliftingTrance,
    manaTea: ManaTea,
    manaSavingTalents: ManaSavingTalents,
    thunderFocusTea: ThunderFocusTea,
    sheilunsGift: SheilunsGift,
    renewingMist: RenewingMist,
    aoeHealingTracker: AOEHealingTracker,

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
    const fightEndTime = this.fight.end_time;
    // const deadTimePercentage = this.modules.alwaysBeCasting.totalTimeWasted / fightDuration;

    const abilityTracker = this.modules.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const velensHealingPercentage = this.modules.velens.healing / this.totalHealing;
    const prydazHealingPercentage = this.modules.prydaz.healing / this.totalHealing;
    const drapeOfShameHealingPercentage = this.modules.drapeOfShame.healing / this.totalHealing;
    const unusedUTProcs = 1 - (this.modules.upliftingTrance.consumedUTProc / this.modules.upliftingTrance.UTProcsTotal);
    const avgSGOverheal = this.modules.sheilunsGift.overhealSG / this.modules.sheilunsGift.castsSG;

    const SGability = getAbility(SPELLS.SHEILUNS_GIFT.id);
    const SGcasts = SGability.casts || 0;
    const avgSGstacks = this.modules.sheilunsGift.stacksTotalSG / SGcasts || 0;

    const manaTea = getAbility(SPELLS.MANA_TEA_TALENT.id);
    const mtCasts = manaTea.casts || 0;
    const avgMTsaves = this.modules.manaTea.manaSavedMT / mtCasts || 0;

    const avgCelestialBreathHealing = this.modules.aoeHealingTracker.healingCelestialBreath / this.modules.aoeHealingTracker.healsCelestialBreath || 0;
    const avgCelestialBreathTargets = this.modules.aoeHealingTracker.healsCelestialBreath / this.modules.aoeHealingTracker.procsCelestialBreath || 0;
    const avgMistsOfSheilunHealing = this.modules.aoeHealingTracker.healingMistsOfSheilun / this.modules.aoeHealingTracker.healsMistsOfSheilun || 0;
    const avgMistsOfSheilunTargets = this.modules.aoeHealingTracker.healsMistsOfSheilun / this.modules.aoeHealingTracker.procsMistsOfSheilun || 0;
    const avgRJWHealing = this.modules.aoeHealingTracker.healingRJW / this.modules.aoeHealingTracker.castRJW || 0;
    const avgRJWTargets = this.modules.aoeHealingTracker.healsRJW / this.modules.aoeHealingTracker.castRJW || 0;


    const wastedSGStacks = this.modules.sheilunsGift.stacksWastedSG + Math.floor((fightEndTime - this.modules.sheilunsGift.lastSGStack) / 10000);

    // Trait Checks
    const hasWhispersOfShaohao = this.selectedCombatant.traitsBySpellId[SPELLS.WHISPERS_OF_SHAOHAO_TRAIT.id] === 1;
    const hasCelestialBreath = this.selectedCombatant.traitsBySpellId[SPELLS.CELESTIAL_BREATH_TRAIT.id] === 1;
    const hasMistsOfSheilun = this.selectedCombatant.traitsBySpellId[SPELLS.MISTS_OF_SHEILUN_TRAIT.id] === 1;
    const hasRJW = this.selectedCombatant.hasTalent(SPELLS.REFRESHING_JADE_WIND_TALENT.id);


    const missedWhispersHeal = ((Math.floor(fightDuration / 10000) + this.modules.sheilunsGift.countEff) - this.modules.sheilunsGift.countWhispersHeal);

    /*
    if (deadTimePercentage > 0.2) {
      results.addIssue({
        issue: `Your dead GCD time can be improved. Try to Always Be Casting (ABC); when there's nothing to heal try to contribute some damage (${Math.round(deadTimePercentage * 100)}% dead GCD time).`,
        icon: 'spell_mage_altertime',
        importance: getIssueImportance(deadTimePercentage, 0.35, 0.4, true),
      });
    }
    */

    // Sheilun's Gift Overhealing issue
    if(hasWhispersOfShaohao && missedWhispersHeal > 10) {
      results.addIssue({
        issue: <span>You missed {missedWhispersHeal} <a href="http://www.wowhead.com/spell=238130" target="_blank">Whispers of Shaohao</a> healing procs.  While you cannot actively place the clouds that spawn, work to position yourself near other members of the raid so that when the clouds are used, they heal someone.</span>,
        icon: SPELLS.WHISPERS_OF_SHAOHAO_TRAIT.icon,
        importance: getIssueImportance(missedWhispersHeal, 12, 15, true)
      });
    }
    // Missed Whispers healing
    if(missedWhispersHeal > 10) {
      results.addIssue({
        issue: <span>You averaged {(avgSGOverheal / 1000).toFixed(0)}k overheal with your <a href="http://www.wowhead.com/spell=205406" target="_blank">Sheilun's Gift</a> and casted with an average of {(this.modules.sheilunsGift.stacksTotalSG / this.modules.sheilunsGift.castsSG).toFixed(0)} stacks.  Consider using <a href="http://www.wowhead.com/spell=205406" target="_blank">Sheilun's Gift</a> at lower stacks to increase effectiveness.</span>,
        icon: SPELLS.SHEILUNS_GIFT.icon,
        importance: getIssueImportance(avgSGOverheal, 325000, 400000, true)
      });
    }
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
        issue: <span>Your mana spent during <a href="http://www.wowhead.com/spell=197908" target="_blank">Mana Tea</a> can be improved.  Always aim to cast your highest mana spells such as <a href="http://www.wowhead.com/spell=191837" target="_blank">Essence Font</a> or <a href="http://www.wowhead.com/spell=116670" target="_blank">Vivify</a>. ({((this.modules.manaTea.manaSaved / this.modules.manaTea.manateaCount) / 1000).toFixed(0)}k avg mana saved)</span>,
        icon: SPELLS.MANA_TEA_TALENT.icon,
        important: getIssueImportance((this.modules.manaTea.manaSaved / this.modules.manateaCount), 160000, 120000),
      })
    }
    // Lifecycles Manasavings
    if(this.modules.manaSavingTalents.hasLifeCycles && this.modules.manaSavingTalents.manaSaved < 200000) {
      results.addIssue({
        issue: <span>Your current spell usage is not taking full advantage of the <a href="http://www.wowhead.com/spell=197915" target="_blank">Lifecycles</a> talent.  You casted {this.modules.manaSavingTalents.castsNonRedViv} / {(this.modules.manaSavingTalents.castsRedViv + this.modules.manaSavingTalents.castsNonRedViv)} Vivfy's and {this.modules.manaSavingTalents.castsNonRedEnm} / {(this.modules.manaSavingTalents.castsRedEnm + this.modules.manaSavingTalents.castsNonRedEnm)} Enveloping Mists without the mana saving buffs provided by <a href="http://www.wowhead.com/spell=197915" target="_blank">Lifecycles</a></span>,
        icon:SPELLS.LIFECYCLES_TALENT.icon,
        important:getIssueImportance(this.modules.manaSavingTalents.manaSaved, 170000, 140000),
      });
    }
    // Incorrect TFT Usage
    if(this.modules.thunderFocusTea.castsUnderTft - (this.modules.thunderFocusTea.castsTftRem + this.modules.thunderFocusTea.castsTftViv) > 1) {
      results.addIssue({
        issue: <span>You are currently using <a href="http://www.wowhead.com/spell=116680" target="_blank">Thunder Focus Tea</a> to buff spells other than <a href="http://www.wowhead.com/spell=116670" target="_blank">Vivify</a> or <a href="http://www.wowhead.com/spell=191837" target="_blank">Essence Font</a>.  You used the TFT buff on {(this.modules.thunderFocusTea.castsUnderTft - (this.modules.thunderFocusTea.castsTftEf + this.modules.thunderFocusTea.castsTftViv))} spells other than Essence Font, or Vivify.</span>,
        icon: SPELLS.THUNDER_FOCUS_TEA.icon,
        important:getIssueImportance(this.modules.thunderFocusTea.castsUnderTft - (this.modules.thunderFocusTea.castsTftRem + this.modules.thunderFocusTea.castsTftViv), 2, 4, true)
      });
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
      // Thunder Focus Tea Usage
      <StatisticBox
        icon={<SpellIcon id={SPELLS.THUNDER_FOCUS_TEA.id} />}
        value={`${this.modules.thunderFocusTea.castsTft} Uses`}
        label={(
          <dfn data-tip={`With your ${this.modules.thunderFocusTea.castsTft} Thunder Focus Tea casts, you buffed the following spells:
            <ul>
              ${this.modules.thunderFocusTea.castsTftViv > 0 ?
              `<li>${(this.modules.thunderFocusTea.castsTftViv)} Vivify buffed (${formatPercentage(this.modules.thunderFocusTea.castsTftViv / this.modules.thunderFocusTea.castsTft)}%)</li>`
              : ""
              }
              ${this.modules.thunderFocusTea.castsTftRem > 0 ?
              `<li>${(this.modules.thunderFocusTea.castsTftRem)} Renewing Mist buffed (${formatPercentage(this.modules.thunderFocusTea.castsTftRem / this.modules.thunderFocusTea.castsTft)}%)</li>`
              : ""
              }
              ${this.modules.thunderFocusTea.castsTftEnm > 0 ?
              `<li>${(this.modules.thunderFocusTea.castsTftEnm)} Enveloping Mists buffed (${formatPercentage(this.modules.thunderFocusTea.castsTftEnm / this.modules.thunderFocusTea.castsTft)}%)</li>`
              : ""
              }
              ${this.modules.thunderFocusTea.castsTftEff > 0 ?
              `<li>${(this.modules.thunderFocusTea.castsTftEff)} Effuse buffed (${formatPercentage(this.modules.thunderFocusTea.castsTftEff / this.modules.thunderFocusTea.castsTft)}%)</li>`
              : ""
              }
              ${this.modules.thunderFocusTea.castsTftEf > 0 ?
              `<li>${(this.modules.thunderFocusTea.castsTftEf)} Essence Font buffed (${formatPercentage(this.modules.thunderFocusTea.castsTftEf / this.modules.thunderFocusTea.castsTft)}%)</li>`
              : ""
              }
            </ul>
            `}>
            Total Thunder Focus Tea casts
          </dfn>
        )}
      />,
      // UT Proc Usage
      <StatisticBox
        icon={<SpellIcon id={SPELLS.UPLIFTING_TRANCE_BUFF.id} />}
        value={`${formatPercentage(unusedUTProcs)} %`}
        label={(
          <dfn data-tip={`You got total <b>${this.modules.upliftingTrance.UTProcsTotal} uplifting trance procs</b> and <b>used ${this.modules.upliftingTrance.consumedUTProc}</b> of them. ${this.modules.upliftingTrance.nonUTVivify} of your vivify's were used without an uplifting trance procs.`}>
            Unused Uplifting Trance Pocs
          </dfn>
        )}
      />,
    // Mana Tea Usage
      this.modules.manaTea.active && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.MANA_TEA_TALENT.id} />}
          value={`${((avgMTsaves) / 1000).toFixed(0)}k mana`}
          label={(
            <dfn
              data-tip={`
                  During your ${this.modules.manaTea.manateaCount} <a href="http://www.wowhead.com/spell=197908" target="_blank">Mana Teas</a> saved the following mana:
                  <ul>
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
    // Lifecycles Usage
      this.modules.manaSavingTalents.hasLifeCycles && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.LIFECYCLES_TALENT.id} />}
          value={`${(this.modules.manaSavingTalents.manaSaved / 1000).toFixed(0)}k mana saved `}
          label={(
            <dfn data-tip={`You saved a total of ${this.modules.manaSavingTalents.manaSaved} from the Lifecycles talent.
              <ul><li>On ${this.modules.manaSavingTalents.castsRedViv} Vivify casts, you saved ${(this.modules.manaSavingTalents.manaSavedViv / 1000).toFixed(0)}k mana. (${formatPercentage(this.modules.manaSavingTalents.castsRedViv / (this.modules.manaSavingTalents.castsRedViv + this.modules.manaSavingTalents.castsNonRedViv))}%)</li>
              <li>On ${this.modules.manaSavingTalents.castsRedEnm} Enveloping Mists casts, you saved ${(this.modules.manaSavingTalents.manaSavedEnm / 1000).toFixed(0)}k mana. (${formatPercentage(this.modules.manaSavingTalents.castsRedEnm / (this.modules.manaSavingTalents.castsRedEnm + this.modules.manaSavingTalents.castsNonRedEnm))}%)</li>
              <li>You casted ${this.modules.manaSavingTalents.castsNonRedViv} Vivify's and ${this.modules.manaSavingTalents.castsNonRedEnm} Enveloping Mists at full mana.</li>
              </ul>
              `}>
              Mana Saved from Lifecycles
            </dfn>
          )}
        />
      ),
      // SotC Usage
      this.modules.manaSavingTalents.hasSotc && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.SPIRIT_OF_THE_CRANE_TALENT.id} />}
          value={`${(this.modules.manaSavingTalents.manaReturnSotc / 1000).toFixed(0)}k mana returned`}
          label={(
            <dfn data-tip={`
                You gained a raw total of ${((this.modules.manaSavingTalents.manaReturnSotc + this.modules.manaSavingTalents.sotcWasted) / 1000).toFixed(0)}k mana from SotC with ${(this.modules.manaSavingTalents.sotcWasted / 1000).toFixed(0)}k wasted.<br>
                You lost ${(this.modules.manaSavingTalents.totmOverCap + this.modules.manaSavingTalents.totmBuffWasted)} Teachings of the Monestery stacks
              <ul>
                ${this.modules.manaSavingTalents.totmOverCap > 0 ?
                `<li>You overcapped Teachings ${(this.modules.manaSavingTalents.totmOverCap)} times</li>`
                : ""
                }
                ${this.modules.manaSavingTalents.totmBuffWasted > 0 ?
                `<li>You let Teachings drop off ${(this.modules.manaSavingTalents.totmBuffWasted)} times</li>`
                : ""
                }
              </ul>
              `}>
              Mana Returned from Spirit of the Crane
            </dfn>
          )}
        />
      ),

      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHEILUNS_GIFT.id} />}
        value={`${(avgSGstacks).toFixed(0)} Stacks`}
        label={(
          <dfn data-tip={`${SGcasts > 0 ? `You healed for an average of ${((this.modules.sheilunsGift.sgHeal / this.modules.sheilunsGift.castsSG) / 1000).toFixed(0)}k with each Sheilun's cast.` : ""}
            ${wastedSGStacks > 0 ? `<br>You wasted ${(wastedSGStacks)} stack(s) during this fight.` : ""}
            `}>
            Avg stacks used
          </dfn>
        )}
      />,
      hasWhispersOfShaohao && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.WHISPERS_OF_SHAOHAO.id} />}
          value={`${(missedWhispersHeal)} missed`}
          label={(
            <dfn data-tip={`You had a total of ${(this.modules.sheilunsGift.countWhispersHeal)} Whispers of Shaohao heals, but had a chance at ${(missedWhispersHeal)} additional heals.`}>
              Total Whispers of Shaohao Heals Missed.
            </dfn>
          )}
        />
      ),

      // Celestial Breath
      hasCelestialBreath && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.CELESTIAL_BREATH_TRAIT.id} />}
          value={`${((avgCelestialBreathHealing) / 1000).toFixed(0)} k`}
          label={(
            <dfn data-tip={`You hit a total of ${this.modules.aoeHealingTracker.healsCelestialBreath} targets with Celestial Breath on ${this.modules.aoeHealingTracker.procsCelestialBreath} casts. (${(avgCelestialBreathTargets / 3).toFixed(1)} Average Targets Hit per Cast.)`}>
              Average Celestial Breath Healing.
            </dfn>
          )}
        />
      ),
      // Mists of Sheilun
      hasMistsOfSheilun && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.MISTS_OF_SHEILUN_TRAIT.id} />}
          value={`${((avgMistsOfSheilunHealing) / 1000).toFixed(0)} k`}
          label={(
            <dfn data-tip={`You hit a total of ${this.modules.aoeHealingTracker.healsMistsOfSheilun} targets with Mists of Sheilun on ${this.modules.aoeHealingTracker.procsMistsOfSheilun} casts. (${(avgMistsOfSheilunTargets).toFixed(1)} Average Targets Hit per Cast.)`}>
              Average Mists of Sheilun Healing.
            </dfn>
          )}
        />
      ),
      // Refreshing Jade Wind
      hasRJW && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.REFRESHING_JADE_WIND_TALENT.id} />}
          value={`${((avgRJWHealing) / 1000).toFixed(0)} k`}
          label={(
            <dfn data-tip={`You hit a total of ${this.modules.aoeHealingTracker.healsRJW} targets with Refreshing Jade Wind on ${this.modules.aoeHealingTracker.castRJW} casts. (${(avgRJWTargets).toFixed(1)} Average Targets Hit per Cast.)`}>
              Average Refreshing Jade Wind Healing.
            </dfn>
          )}
        />
      ),
      this.modules.renewingMist.active && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.DANCING_MISTS.id} />}
          value={`${(this.modules.renewingMist.dancingMistProc)} procs`}
          label={(
            <dfn data-tip={`You had a total of ${(this.modules.renewingMist.dancingMistProc)} procs on ${this.modules.renewingMist.castsREM} REM casts.`}>
              Total Dancing Mists Procs
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
