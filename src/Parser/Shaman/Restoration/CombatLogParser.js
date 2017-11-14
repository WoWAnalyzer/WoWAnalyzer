import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';

import StatisticBox from 'Main/StatisticBox';
import Tab from 'Main/Tab';
import Mana from 'Main/Mana';
import Feeding from 'Main/Feeding';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import LowHealthHealing from 'Parser/Core/Modules/LowHealthHealing';
import HealingDone from 'Parser/Core/Modules/HealingDone';

import ShamanAbilityTracker from './Modules/ShamanCore/ShamanAbilityTracker';

import MasteryEffectiveness from './Modules/Features/MasteryEffectiveness';
import EarthenShieldTotem from './Modules/Features/EarthenShieldTotem';
import HighTide from './Modules/Features/HighTide';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import CastEfficiency from './Modules/Features/CastEfficiency';

import Nazjatar from './Modules/Legendaries/Nazjatar';
import UncertainReminder from './Modules/Legendaries/UncertainReminder';
import Jonat from './Modules/Legendaries/Jonat';
import Nobundo from './Modules/Legendaries/Nobundo';
import Tidecallers from './Modules/Legendaries/Tidecallers';
import Restoration_Shaman_T19_2Set from './Modules/Legendaries/T19_2Set';
import Restoration_Shaman_T20_4Set from './Modules/Legendaries/T20_4Set';
import AncestralVigor from './Modules/Features/AncestralVigor';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';

import UnusedTidalWavesImage from './Images/spell_shaman_tidalwaves-bw.jpg';

function formatThousands(number) {
  return (`${Math.round(number || 0)}`).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
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
    // Override the ability tracker so we also get stats for Tidal Waves and beacon healing
    abilityTracker: ShamanAbilityTracker,
    lowHealthHealing: LowHealthHealing,
    healingDone: [HealingDone, { showStatistic: true }],

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    masteryEffectiveness: MasteryEffectiveness,
    earthenShieldTotem: EarthenShieldTotem,
    highTide: HighTide,
    cooldownThroughputTracker: CooldownThroughputTracker,
    ancestralVigor: AncestralVigor,
    castEfficiency: CastEfficiency,

    // Legendaries:
    nobundo: Nobundo,
    nazjatar: Nazjatar,
    uncertainReminder: UncertainReminder,
    jonat: Jonat,
    tidecallers: Tidecallers,
    t19_2Set: Restoration_Shaman_T19_2Set,
    t20_4Set: Restoration_Shaman_T20_4Set,
  };

  generateResults() {
    const results = super.generateResults();

    const fightDuration = this.fightDuration;

    const abilityTracker = this.modules.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const earthenShieldTotemCast = getAbility(SPELLS.EARTHEN_SHIELD_TOTEM_TALENT.id);
    const earthenShieldHealing = this.modules.earthenShieldTotem.healing || 0;
    const earthenShieldPotentialHealing = this.modules.earthenShieldTotem.potentialHealing || 0;
    const earthenShieldEfficiency = earthenShieldHealing / earthenShieldPotentialHealing;
    const earthenShieldCasts = earthenShieldTotemCast.casts || 0;

    // The Earthenshield absorb is not directly attributed to the player and thus not
    // by default included in the total healing.
    const totalHealing = this.modules.healingDone.total.effective + (earthenShieldHealing || 0);

    const riptide = getAbility(SPELLS.RIPTIDE.id);
    const healingWave = getAbility(SPELLS.HEALING_WAVE.id);
    const healingSurge = getAbility(SPELLS.HEALING_SURGE_RESTORATION.id);
    const chainHeal = getAbility(SPELLS.CHAIN_HEAL.id);
    const giftOfTheQueen = getAbility(SPELLS.GIFT_OF_THE_QUEEN.id);
    const giftOfTheQueenDuplicate = getAbility(SPELLS.GIFT_OF_THE_QUEEN_DUPLICATE.id);

    const nazjatarRiptideResets = this.modules.nazjatar.resets;
    const nobundoDiscountedHealingSurges = this.modules.nobundo.discounts;
    const jonatHealingPercentage = this.modules.jonat.healing / totalHealing;

    const rootsRawHealing = getAbility(208981).healingEffective;
    const rootsRawHealingPercentage = rootsRawHealing / totalHealing;
    const rootsInteractionHealing = this.modules.cooldownThroughputTracker.getIndirectHealing(208981);
    const rootsInteractionHealingPercentage = rootsInteractionHealing / totalHealing;
    const rootsHealingPercentage = rootsRawHealingPercentage + rootsInteractionHealingPercentage;

    const tidecallersHTTPercentage = this.modules.tidecallers.httHealing / totalHealing;
    const tidecallersHSTPercentage = this.modules.tidecallers.hstHealing / totalHealing;
    const tidecallersHealingPercentage = tidecallersHTTPercentage + tidecallersHSTPercentage;
    const highTideHealingPercentage = this.modules.highTide.healing / totalHealing;

    const uncertainReminderUrgencyHealingPercentage = this.modules.uncertainReminder.urgencyHealing / totalHealing;
    const uncertainReminderHasteHealingPercentage = this.modules.uncertainReminder.hasteHealing / totalHealing;
    const uncertainReminderHealingPercentage = uncertainReminderHasteHealingPercentage + uncertainReminderUrgencyHealingPercentage;

    const chainHealCasts = chainHeal.casts || 0;
    const riptideCasts = riptide.casts || 0;
    const twPerRiptide = this.modules.combatants.selected.hasTalent(SPELLS.CRASHING_WAVES_TALENT.id) ? 2 : 1;
    const totalTwGenerated = twPerRiptide * riptideCasts + chainHealCasts;
    const twHealingWaves = healingWave.healingTwHits || 0;
    const healingWaves = healingWave.casts || 0;
    const twHealingSurges = healingSurge.healingTwHits || 0;
    const healingSurges = healingSurge.casts || 0;
    const unbuffedHealingSurges = healingSurges - twHealingSurges;
    const totalTwUsed = twHealingWaves + twHealingSurges;
    const giftOfTheQueenCasts = giftOfTheQueen.casts || 0;

    const chainHealHits = chainHeal.healingHits || 0;
    const chainHealAvgHits = chainHealHits / chainHealCasts;
    const maxChainHealTargets = this.modules.combatants.selected.hasTalent(SPELLS.HIGH_TIDE_TALENT.id) ? 5 : 4;
    const chainHealTargetEfficiency = chainHealAvgHits / maxChainHealTargets;

    const hasDeepWaters = this.modules.combatants.selected.traitsBySpellId[SPELLS.DEEP_WATERS.id] > 0;
    const giftOfTheQueenHits = giftOfTheQueen.healingHits || 0;
    const giftOfTheQueenDuplicateHits = giftOfTheQueenDuplicate.healingHits || 0;
    const giftOfTheQueenAvgHits = (giftOfTheQueenHits+giftOfTheQueenDuplicateHits) / giftOfTheQueenCasts /(hasDeepWaters ? 2 : 1);
    const giftOfTheQueenTargetEfficiency = giftOfTheQueenAvgHits / 6;

    const giftOfTheQueenRawHealing = giftOfTheQueen.healingEffective + giftOfTheQueen.healingOverheal;
    const giftOfTheQueenDuplicateRawHealing = giftOfTheQueenDuplicate.healingEffective + giftOfTheQueenDuplicate.healingOverheal;
    let giftOfTheQueenCBTFeeding = 0;
    if (this.modules.cooldownThroughputTracker.cbtFeed[SPELLS.GIFT_OF_THE_QUEEN.id]) {
      giftOfTheQueenCBTFeeding += this.modules.cooldownThroughputTracker.cbtFeed[SPELLS.GIFT_OF_THE_QUEEN.id].healing;
    }
    if (this.modules.cooldownThroughputTracker.cbtFeed[SPELLS.GIFT_OF_THE_QUEEN_DUPLICATE.id]) {
      giftOfTheQueenCBTFeeding += this.modules.cooldownThroughputTracker.cbtFeed[SPELLS.GIFT_OF_THE_QUEEN_DUPLICATE.id].healing;
    }
    const hasCBT = this.modules.combatants.selected.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id);
    const giftOfTheQueenCBTFeedingPercent = giftOfTheQueenCBTFeeding / (giftOfTheQueenRawHealing+giftOfTheQueenDuplicateRawHealing);

    const totalMasteryHealing = this.modules.masteryEffectiveness.totalMasteryHealing || 0;
    const totalMaxPotentialMasteryHealing = this.modules.masteryEffectiveness.totalMaxPotentialMasteryHealing || 0;
    const masteryEffectivenessPercent = totalMasteryHealing / totalMaxPotentialMasteryHealing;
    const masteryPercent = this.modules.combatants.selected.masteryPercentage;
    const avgEffectiveMasteryPercent = masteryEffectivenessPercent * masteryPercent;

    const has2PT19 = this.modules.combatants.selected.hasBuff(SPELLS.RESTORATION_SHAMAN_T19_2SET_BONUS_BUFF.id);
    const t19_2PHealingPercentage = this.modules.t19_2Set.healing / totalHealing;

    const t20_4PHealingPercentage = this.modules.t20_4Set.healing / totalHealing;

    this.modules.cooldownThroughputTracker.processAll();

    const unusedTwRate = 1 - totalTwUsed / totalTwGenerated;

    if (unbuffedHealingSurges > 0) {
      results.addIssue({
        issue: <span>Casting <SpellLink id={SPELLS.HEALING_SURGE_RESTORATION.id} /> without <SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} /> is very inefficient, try not to cast more than is necessary ({unbuffedHealingSurges}/{healingSurges} casts unbuffed).</span>,
        icon: SPELLS.HEALING_SURGE_RESTORATION.icon,
        importance: getIssueImportance(unbuffedHealingSurges / (healingSurges + healingWaves), 0.15, 0.30, true),
      });
    }
    if (chainHealTargetEfficiency < 0.97) {
      results.addIssue({
        issue: <span>Try to always cast <SpellLink id={SPELLS.CHAIN_HEAL.id} /> on groups of people, so that it heals all {maxChainHealTargets} potential targets (average of {chainHealAvgHits.toFixed(2)}/{maxChainHealTargets} targets healed).</span>,
        icon: SPELLS.CHAIN_HEAL.icon,
        importance: getIssueImportance(chainHealTargetEfficiency, 0.94, 0.88),
      });
    }
    if (giftOfTheQueenTargetEfficiency < 0.95) {
      results.addIssue({
        issue: <span>Try to always cast <SpellLink id={SPELLS.GIFT_OF_THE_QUEEN.id} /> at a position where both the initial hit and the echo from <SpellLink id={SPELLS.DEEP_WATERS.id} /> will hit all 6 potential targets (average of {giftOfTheQueenAvgHits.toFixed(2)}/6 targets healed).</span>,
        icon: SPELLS.GIFT_OF_THE_QUEEN.icon,
        importance: getIssueImportance(giftOfTheQueenTargetEfficiency, 0.90, 0.80),
      });
    }
    if (hasCBT && giftOfTheQueenCBTFeedingPercent < 0.85) {
      results.addIssue({
        issue: <span>Try to cast <SpellLink id={SPELLS.GIFT_OF_THE_QUEEN.id} /> while <SpellLink id={SPELLS.CLOUDBURST_TOTEM_TALENT.id} /> is up as much as possible ({formatPercentage(giftOfTheQueenCBTFeedingPercent)}% of GotQ healing fed into CBT).</span>,
        icon: SPELLS.GIFT_OF_THE_QUEEN.icon,
        importance: getIssueImportance(giftOfTheQueenCBTFeedingPercent, 0.65, 0.45),
      });
    }
    if (this.modules.earthenShieldTotem.active && earthenShieldEfficiency < 0.75) {
      results.addIssue({
        issue: <span>Try to cast <SpellLink id={SPELLS.EARTHEN_SHIELD_TOTEM_TALENT.id} /> at times- and positions where there will be as many people taking damage possible inside of it to maximize the amount it absorbs (average of {formatPercentage(earthenShieldEfficiency)}% of potential absorb used). </span>,
        icon: SPELLS.EARTHEN_SHIELD_TOTEM_TALENT.icon,
        importance: getIssueImportance(earthenShieldEfficiency, 0.60, 0.45),
      });
    }
    if (unusedTwRate > 0.15) {
      results.addIssue({
        issue: <span><SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} /> buffed <SpellLink id={SPELLS.HEALING_WAVE.id} /> can make for some very efficient healing, consider casting more of them ({formatPercentage(unusedTwRate)}% unused Tidal Waves).</span>,
        icon: SPELLS.TIDAL_WAVES_BUFF.icon,
        importance: getIssueImportance(unusedTwRate, 0.30, 0.50, true),
      });
    }
    if (this.modules.uncertainReminder.active && uncertainReminderHealingPercentage < 0.045) {
      results.addIssue({
        issue: <span>You didn't benefit from <ItemLink id={ITEMS.UNCERTAIN_REMINDER.id} /> a lot ({formatPercentage(uncertainReminderHealingPercentage)}% of your healing), consider using a different legendary on long fights or on fights where there is not much to heal during the additional heroism uptime.</span>,
        icon: ITEMS.UNCERTAIN_REMINDER.icon,
        importance: getIssueImportance(uncertainReminderHealingPercentage, 0.035, 0.025),
      });
    }

    results.statistics = [
      ...results.statistics,
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DEEP_HEALING.id} />}
        value={`${formatPercentage(masteryEffectivenessPercent)}%`}
        label={(
          <dfn data-tip={`The percent of your mastery that you benefited from on average (so always between 0% and 100%). Since you have ${formatPercentage(masteryPercent)}% mastery, this means that on average your heals were increased by ${formatPercentage(avgEffectiveMasteryPercent)}% by your mastery. <br /><br />This does not account for temporary mastery procs.`}>
            Mastery benefit
          </dfn>
        )}
      />,
      <StatisticBox
        icon={<SpellIcon id={SPELLS.TIDAL_WAVES_BUFF.id} />}
        value={`${twHealingWaves} : ${twHealingSurges}`}
        label={(
          <dfn data-tip={`The Tidal Waves Healing Wave to Healing Surge usage ratio is how many Healing Waves you cast compared to Healing Surges during the Tidal Waves proc. You cast ${twHealingWaves} Healing Waves and ${twHealingSurges} Healing Surges during Tidal Waves.`}>
            TW HW : TW HS cast ratio
          </dfn>
        )}
      />,
      <StatisticBox
        icon={(
          <SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id}>
            <img
              src={UnusedTidalWavesImage}
              alt="Unused Tidal Waves"
            />
          </SpellLink>
        )}
        value={`${formatPercentage(unusedTwRate)} %`}
        label={(
          <dfn data-tip={`The amount of Tidal Waves charges you did not use out of the total available. You cast ${riptideCasts} Riptides and ${chainHealCasts} Chain Heals which gave you ${totalTwGenerated} Tidal Waves charges, of which you used ${totalTwUsed}.<br /><br />The ratio may be below zero if you started the fight with Tidal Waves charges.`}>
            Unused Tidal Waves
          </dfn>
        )}
      />,
      chainHealCasts > 0 && <StatisticBox
        icon={<SpellIcon id={SPELLS.CHAIN_HEAL.id} />}
        value={`${formatPercentage(chainHealTargetEfficiency)} %`}
        label={(
          <dfn data-tip={`The average percentage of targets healed by Chain Heal out of the maximum amount of targets. You cast a total of ${chainHealCasts} Chain Heals, which healed an average of ${chainHealAvgHits.toFixed(2)} out of ${maxChainHealTargets} targets.`}>

            Chain Heal target efficiency
          </dfn>
        )}
      />,
      giftOfTheQueenCasts > 0 && <StatisticBox
        icon={<SpellIcon id={SPELLS.GIFT_OF_THE_QUEEN.id} />}
        value={`${formatPercentage(giftOfTheQueenTargetEfficiency)} %`}
        label={(
          <dfn data-tip={`The average percentage of targets healed by Gift of the Queen out of the maximum amount of targets. You cast a total of ${giftOfTheQueenCasts} Gift of the Queens, which healed an average of ${giftOfTheQueenAvgHits.toFixed(2)} out of 6 targets.`}>

            GotQ target efficiency
          </dfn>
        )}
      />,
      this.modules.highTide.active > 0 && <StatisticBox
        icon={<SpellIcon id={SPELLS.HIGH_TIDE_TALENT.id} />}
        value={`${formatPercentage(highTideHealingPercentage)} %`}
        label={(
          <dfn data-tip={'The percentage of your healing that is caused by High Tide.'}>

            High Tide healing
          </dfn>
        )}
      />,
      this.modules.earthenShieldTotem.active > 0 && <StatisticBox
        icon={<SpellIcon id={SPELLS.EARTHEN_SHIELD_TOTEM_TALENT.id} />}
        value={`${formatPercentage(earthenShieldEfficiency)} %`}
        label={(
          <dfn data-tip={`The percentage of the potential absorb of Earthen Shield Totem that was actually used. You cast a total of ${earthenShieldCasts} Earthen Shield Totems with a combined health of ${formatNumber(earthenShieldPotentialHealing)}, which absorbed a total of ${formatNumber(earthenShieldHealing)} damage.`}>

            Earthen Shield Totem efficiency
          </dfn>
        )}
      />,
    ];

    results.items = [
      ...results.items,
      this.modules.uncertainReminder.active && {
        item: ITEMS.UNCERTAIN_REMINDER,
        result: (
          <dfn data-tip="The effective healing contributed by the additional Heroism uptime from Uncertain Reminder. This includes the +25% healing modifier from the Sense of Urgency artifact trait for all your spells, and a 30% haste modifier on your spells of which their throughput scales linear with haste: Healing Wave, Healing Surge, Chain Heal, Healing Rain, Healing Stream Totem and Riptide HoT. Healing Tide Totem is also included, though underestimated, as the Cumulative Upkeep trait will make it scale more than linear.">
            {((uncertainReminderHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber((this.modules.uncertainReminder.urgencyHealing + this.modules.uncertainReminder.hasteHealing) / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      this.modules.jonat.active && {
        item: ITEMS.FOCUSER_OF_JONAT,
        result: (
          <span>
            {((jonatHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.jonat.healing / fightDuration * 1000)} HPS
          </span>
        ),
      },
      this.modules.combatants.selected.hasLegs(ITEMS.ROOTS_OF_SHALADRASSIL.id) && {
        item: ITEMS.ROOTS_OF_SHALADRASSIL,
        result: (
          <dfn data-tip={`The effective healing contributed by Roots of Shaladrassil. Of this healing, ${formatPercentage(rootsRawHealingPercentage)}% is the raw healing they provide, and ${formatPercentage(rootsInteractionHealingPercentage)}% is indirect healing done through Cloudburst Totem, Ancestral Guidance and Ascendance. <br /><br />The interactions of these 3 cooldowns are currently not included, so in case there's overlap between these cooldowns the real healing would be slightly higher than indicated.`}>
            {((rootsHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(rootsRawHealing / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      this.modules.tidecallers.active && {
        item: ITEMS.PRAETORIANS_TIDECALLERS,
        result: (
          <dfn data-tip={`The healing gained from the extra duration that Praetorian's Tidecallers give to Healing Tide Totem and Healing Stream Totem. The increased duration on Healing Stream Totem accounts for ${formatPercentage(tidecallersHSTPercentage)}% healing, the increased duration on Healing Tide Totem for ${formatPercentage(tidecallersHTTPercentage)}% healing.`}>
            {((tidecallersHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber((this.modules.tidecallers.httHealing + this.modules.tidecallers.hstHealing) / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      this.modules.nazjatar.active && {
        item: ITEMS.INTACT_NAZJATAR_MOLTING,
        result: (
          <span>
            {nazjatarRiptideResets} Riptide resets
          </span>
        ),
      },
      this.modules.nobundo.active && {
        item: ITEMS.NOBUNDOS_REDEMPTION,
        result: (
          <span>
            {nobundoDiscountedHealingSurges} discounted Healing Surges
          </span>
        ),
      },
      has2PT19 && {
        id: `spell-${SPELLS.RESTORATION_SHAMAN_T19_2SET_BONUS_BUFF.id}`,
        icon: <SpellIcon id={SPELLS.RESTORATION_SHAMAN_T19_2SET_BONUS_BUFF.id} />,
        title: <SpellLink id={SPELLS.RESTORATION_SHAMAN_T19_2SET_BONUS_BUFF.id} />,
        result: (
          <span>
            {((t19_2PHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.t19_2Set.healing / fightDuration * 1000)} HPS
          </span>
        ),
      },
      this.modules.t20_4Set.active && {
        id: `spell-${SPELLS.RESTORATION_SHAMAN_T20_4SET_BONUS_BUFF.id}`,
        icon: <SpellIcon id={SPELLS.RESTORATION_SHAMAN_T20_4SET_BONUS_BUFF.id} />,
        title: <SpellLink id={SPELLS.RESTORATION_SHAMAN_T20_4SET_BONUS_BUFF.id} />,
        result: (
          <span>
            {((t20_4PHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.t20_4Set.healing / fightDuration * 1000)} HPS
          </span>
        ),
      },
    ];

    results.tabs = [
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
        title: 'Feeding',
        url: 'feeding',
        render: () => (
          <Tab title="Feeding" style={{ padding: 0 }}>
            <Feeding
              cooldownThroughputTracker={this.modules.cooldownThroughputTracker}
            />
          </Tab>
        ),
      },
    ];

    return results;
  }
}

export default CombatLogParser;
