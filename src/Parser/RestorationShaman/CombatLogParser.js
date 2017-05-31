import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import ITEMS from 'common/ITEMS';
import Icon from 'common/Icon';
import ItemLink from 'common/ItemLink';
import ItemIcon from 'common/ItemIcon';

import StatisticBox from 'Main/StatisticBox';
import SuggestionsTab from 'Main/SuggestionsTab';
import TalentsTab from 'Main/TalentsTab';
import CastEfficiencyTab from 'Main/CastEfficiencyTab';
import CooldownsTab from 'Main/CooldownsTab';
import ManaTab from 'Main/ManaTab';
import FeedingTab from 'Main/FeedingTab';

import MainCombatLogParser from 'Parser/Core/CombatLogParser';
import ParseResults from 'Parser/Core/ParseResults';
import getCastEfficiency from 'Parser/Core/getCastEfficiency';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import Prydaz from 'Parser/Core/Modules/Items/Prydaz';

import ShamanAbilityTracker from './Modules/ShamanCore/ShamanAbilityTracker';

import MasteryEffectiveness from './Modules/Features/MasteryEffectiveness';
import EarthenShieldTotem from './Modules/Features/EarthenShieldTotem';
import HighTide from './Modules/Features/HighTide';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownTracker from './Modules/Features/CooldownTracker';


import DrapeOfShame from './Modules/Legendaries/DrapeOfShame';
import Velens from './Modules/Legendaries/Velens';
import Nazjatar from './Modules/Legendaries/Nazjatar';
import UncertainReminder from './Modules/Legendaries/UncertainReminder';
import Jonat from './Modules/Legendaries/Jonat';
import Nobundo from './Modules/Legendaries/Nobundo';
import Tidecallers from './Modules/Legendaries/Tidecallers';
import Restoration_Shaman_T19_2Set from './Modules/Legendaries/T19_2Set';

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
    // Override the ability tracker so we also get stats for Tidal Waves and beacon healing
    abilityTracker: ShamanAbilityTracker,


    // Features
    alwaysBeCasting: AlwaysBeCasting,
    masteryEffectiveness: MasteryEffectiveness,
    earthenShieldTotem: EarthenShieldTotem,
    highTide: HighTide,
    cooldownTracker: CooldownTracker,
    
    

    // Legendaries:
    drapeOfShame: DrapeOfShame,
    velens: Velens,
    nobundo: Nobundo,
    nazjatar: Nazjatar,
    uncertainReminder: UncertainReminder,
    jonat: Jonat,
    tidecallers: Tidecallers,
    prydaz: Prydaz,
    t19_2Set: Restoration_Shaman_T19_2Set,
  };

  generateResults() {
    const results = new ParseResults();

    const fightDuration = this.fightDuration;

    const abilityTracker = this.modules.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);


    const earthenShieldTotemCast = getAbility(SPELLS.EARTHEN_SHIELD_TOTEM_CAST.id);
    const earthenShieldHealing = this.modules.earthenShieldTotem.healing || 0;
    const earthenShieldPotentialHealing = this.modules.earthenShieldTotem.potentialHealing || 0;
    const earthenShieldEfficiency = earthenShieldHealing / earthenShieldPotentialHealing;
    const earthenShieldCasts = earthenShieldTotemCast.casts || 0;

    // The Earthenshield absorb is not directly attributed to the player and thus not
    // by default included in the total healing.
    const totalHealing = this.totalHealing + (earthenShieldHealing || 0);

    const riptide = getAbility(SPELLS.RIPTIDE.id);
    const healingWave = getAbility(SPELLS.HEALING_WAVE.id);
    const healingSurge = getAbility(SPELLS.HEALING_SURGE.id);
    const chainHeal = getAbility(SPELLS.CHAIN_HEAL.id);
    const giftOfTheQueen = getAbility(SPELLS.GIFT_OF_THE_QUEEN.id)

    const nonHealingTimePercentage = this.modules.alwaysBeCasting.totalHealingTimeWasted / fightDuration;
    const deadTimePercentage = this.modules.alwaysBeCasting.totalTimeWasted / fightDuration;
    const velensHealingPercentage = this.modules.velens.healing / totalHealing;
    const nazjatarRiptideResets = this.modules.nazjatar.resets;
    const nobundoDiscountedHealingSurges = this.modules.nobundo.discounts;
    const jonatHealingPercentage = this.modules.jonat.healing / totalHealing;

    const rootsRawHealing = getAbility(208981).healingEffective;
    const rootsRawHealingPercentage = rootsRawHealing / totalHealing;
    const rootsInteractionHealing = this.modules.cooldownTracker.getIndirectHealing(208981);
    const rootsInteractionHealingPercentage = rootsInteractionHealing / totalHealing;
    const rootsHealingPercentage = rootsRawHealingPercentage + rootsInteractionHealingPercentage

    const prydazHealingPercentage = this.modules.prydaz.healing / totalHealing;
    const drapeOfShameHealingPercentage = this.modules.drapeOfShame.healing / totalHealing;
    const tidecallersHTTPercentage = this.modules.tidecallers.httHealing / totalHealing;
    const tidecallersHSTPercentage = this.modules.tidecallers.hstHealing / totalHealing;
    const tidecallersHealingPercentage = tidecallersHTTPercentage + tidecallersHSTPercentage;
    const highTideHealingPercentage = this.modules.highTide.healing / totalHealing;

    const uncertainReminderUrgencyHealingPercentage = this.modules.uncertainReminder.urgencyHealing / totalHealing;
    const uncertainReminderHasteHealingPercentage = this.modules.uncertainReminder.hasteHealing / totalHealing;
    const uncertainReminderHealingPercentage = uncertainReminderHasteHealingPercentage + uncertainReminderUrgencyHealingPercentage;

    const chainHealCasts = chainHeal.casts || 0;
    const riptideCasts = riptide.casts || 0;
    const twPerRiptide = this.selectedCombatant.hasTalent(SPELLS.CRASHING_WAVES_TALENT.id) ? 2 : 1;
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
    const maxChainHealTargets = this.selectedCombatant.hasTalent(SPELLS.HIGH_TIDE_TALENT.id) ? 5 : 4;
    const chainHealTargetEfficiency = chainHealAvgHits / maxChainHealTargets;

    const hasDeepWaters = this.selectedCombatant.traitsBySpellId[SPELLS.DEEP_WATERS.id]>0
    const giftOfTheQueenHits = giftOfTheQueen.healingHits || 0;
    const giftOfTheQueenAvgHits = giftOfTheQueenHits / giftOfTheQueenCasts / (hasDeepWaters ? 2 : 1);
    const giftOfTheQueenTargetEfficiency = giftOfTheQueenAvgHits / 6;

    const giftOfTheQueenRawHealing = giftOfTheQueen.healingEffective + giftOfTheQueen.healingOverheal;
    let giftOfTheQueenCBTFeeding = 0;
    if (this.modules.cooldownTracker.cbtFeed[SPELLS.GIFT_OF_THE_QUEEN.id]) {
      giftOfTheQueenCBTFeeding = this.modules.cooldownTracker.cbtFeed[SPELLS.GIFT_OF_THE_QUEEN.id].healing;
    }
    const hasCBT = this.selectedCombatant.hasTalent(SPELLS.CLOUDBURST_TOTEM_CAST.id)
    const giftOfTheQueenCBTFeedingPercent = giftOfTheQueenCBTFeeding / giftOfTheQueenRawHealing;



    const totalMasteryHealing = this.modules.masteryEffectiveness.totalMasteryHealing || 0;
    const totalMaxPotentialMasteryHealing = this.modules.masteryEffectiveness.totalMaxPotentialMasteryHealing || 0;
    const masteryEffectivenessPercent = totalMasteryHealing / totalMaxPotentialMasteryHealing;
    const masteryPercent = this.selectedCombatant.masteryPercentage;
    const avgEffectiveMasteryPercent = masteryEffectivenessPercent * masteryPercent;


    const has2PT19 = this.selectedCombatant.hasBuff(SPELLS.RESTORATION_SHAMAN_T19_2SET_BONUS_BUFF.id);
    const t19_2PHealingPercentage = this.modules.t19_2Set.healing / totalHealing;
    


    this.modules.cooldownTracker.processAll();

    const unusedTwRate = 1 - totalTwUsed / totalTwGenerated;

    if (nonHealingTimePercentage > 0.3) {
      results.addIssue({
        issue: `Your non healing time can be improved. Try to cast heals more regularly (${Math.round(nonHealingTimePercentage * 100)}% non healing time).`,
        icon: 'petbattle_health-down',
        importance: getIssueImportance(nonHealingTimePercentage, 0.4, 0.45, true),
      });
    }
    if (deadTimePercentage > 0.2) {
      results.addIssue({
        issue: `Your dead GCD time can be improved. Try to Always Be Casting (ABC); when you're not healing try to contribute some damage (${Math.round(deadTimePercentage * 100)}% dead GCD time).`,
        icon: 'spell_mage_altertime',
        importance: getIssueImportance(deadTimePercentage, 0.35, 0.4, true),
      });
    }
    if (this.modules.velens.active && velensHealingPercentage < 0.045) {
      results.addIssue({
        issue: <span>Your usage of <ItemLink id={ITEMS.VELENS_FUTURE_SIGHT.id} /> can be improved. Try to maximize the amount of casts during the buff or consider using an easier legendary ({(velensHealingPercentage * 100).toFixed(2)}% healing contributed).</span>,
        icon: ITEMS.VELENS_FUTURE_SIGHT.icon,
        importance: getIssueImportance(velensHealingPercentage, 0.04, 0.03),
      });
    }
    if (unbuffedHealingSurges > 0) {
      results.addIssue({
        issue: <span>Casting <SpellLink id={SPELLS.HEALING_SURGE.id} /> without <SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} /> is very inefficient, try not to cast more than is necessary ({unbuffedHealingSurges}/{healingSurges} casts unbuffed).</span>,
        icon: SPELLS.HEALING_SURGE.icon,
        importance: getIssueImportance(unbuffedHealingSurges / (healingSurges+healingWaves), 0.15, 0.30, true),
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
        issue: <span>Try to cast <SpellLink id={SPELLS.GIFT_OF_THE_QUEEN.id} /> while <SpellLink id={SPELLS.CLOUDBURST_TOTEM_CAST.id} /> is up as much as possible ({formatPercentage(giftOfTheQueenCBTFeedingPercent)}% of GotQ healing fed into CBT).</span>,
        icon: SPELLS.GIFT_OF_THE_QUEEN.icon,
        importance: getIssueImportance(giftOfTheQueenCBTFeedingPercent, 0.65, 0.45),
      });
    }
    if (this.modules.earthenShieldTotem.active && earthenShieldEfficiency < 0.75) {
      results.addIssue({
        issue: <span>Try to cast <SpellLink id={SPELLS.EARTHEN_SHIELD_TOTEM_CAST.id} /> at times- and positions where there will be as many people taking damage possible inside of it to maximize the amount it absorbs (average of {formatPercentage(earthenShieldEfficiency)}% of potential absorb used). </span>,
        icon: SPELLS.EARTHEN_SHIELD_TOTEM_CAST.icon,
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
          />)}
        value={`${formatNumber(totalHealing / fightDuration * 1000)} HPS`}
        label={(
          <dfn data-tip={`The total healing done recorded was ${formatThousands(totalHealing)}.`}>
            Healing done
          </dfn>
        )}
      />,
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
              src="./img/spell_shaman_tidalwaves-bw.jpg"
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
          <dfn data-tip={`The percentage of your healing that is caused by High Tide.`}>

          High Tide healing
          </dfn>
        )}
      />,
      this.modules.earthenShieldTotem.active > 0 && <StatisticBox
        icon={<SpellIcon id={SPELLS.EARTHEN_SHIELD_TOTEM_CAST.id} />}
        value={`${formatPercentage(earthenShieldEfficiency)} %`}
        label={(
          <dfn data-tip={`The percentage of the potential absorb of Earthen Shield Totem that was actually used. You cast a total of ${earthenShieldCasts} Earthen Shield Totems with a combined health of ${formatNumber(earthenShieldPotentialHealing)}, which absorbed a total of ${formatNumber(earthenShieldHealing)} damage.`}>

            Earthen Shield Totem efficiency
          </dfn>
        )}
      />,
      <StatisticBox
        icon={<Icon icon="petbattle_health-down" alt="Non healing time" />}
        
        value={`${formatPercentage(nonHealingTimePercentage)} %`}
        label={(
          <dfn data-tip={`Non healing time is available casting time not used for a spell that helps you heal. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/stunned), DPSing, etc. <br /><br />You spent ${formatPercentage(deadTimePercentage)}% of your time casting nothing at all.`}>
            Non healing time
          </dfn>
        )}
      />,
    ];

    results.items = [
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
      this.modules.uncertainReminder.active && {
        id: ITEMS.UNCERTAIN_REMINDER.id,
        icon: <ItemIcon id={ITEMS.UNCERTAIN_REMINDER.id} />,
        title: <ItemLink id={ITEMS.UNCERTAIN_REMINDER.id} />,
        result: (
          <dfn data-tip="The effective healing contributed by the additional Heroism uptime from Uncertain Reminder. This includes the +25% healing modifier from the Sense of Urgency artifact trait for all your spells, and a 30% haste modifier on your spells of which their throughput scales linear with haste: Healing Wave, Healing Surge, Chain Heal, Healing Rain, Healing Stream Totem and Riptide HoT. Healing Tide Totem is also included, though underestimated, as the Cumulative Upkeep trait will make it scale more than linear.">
            {((uncertainReminderHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber((this.modules.uncertainReminder.urgencyHealing + this.modules.uncertainReminder.hasteHealing) / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      this.modules.jonat.active && {
        id: ITEMS.FOCUSER_OF_JONAT.id,
        icon: <ItemIcon id={ITEMS.FOCUSER_OF_JONAT.id} />,
        title: <ItemLink id={ITEMS.FOCUSER_OF_JONAT.id} />,
        result: (
          <dfn data-tip={`The extra healing from your Chain Heals from the Focuser of Jonat buff.`}>
            {((jonatHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.jonat.healing / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      this.selectedCombatant.hasLegs(ITEMS.ROOTS_OF_SHALADRASSIL.id) && {
        id: ITEMS.ROOTS_OF_SHALADRASSIL.id,
        icon: <ItemIcon id={ITEMS.ROOTS_OF_SHALADRASSIL.id} />,
        title: <ItemLink id={ITEMS.ROOTS_OF_SHALADRASSIL.id} />,
        result: (
          <dfn data-tip={`The effective healing contributed by Roots of Shaladrassil. Of this healing, ${formatPercentage(rootsRawHealingPercentage)}% is the raw healing they provide, and ${formatPercentage(rootsInteractionHealingPercentage)}% is indirect healing done through Cloudburst Totem, Ancestral Guidance and Ascendance. <br /><br />The interactions of these 3 cooldowns are currently not included, so in case there's overlap between these cooldowns the real healing would be slightly higher than indicated.`}>
            {((rootsHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(rootsRawHealing / fightDuration * 1000)} HPS
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
      this.modules.tidecallers.active && {
        id: ITEMS.PRAETORIANS_TIDECALLERS.id,
        icon: <ItemIcon id={ITEMS.PRAETORIANS_TIDECALLERS.id} />,
        title: <ItemLink id={ITEMS.PRAETORIANS_TIDECALLERS.id} />,
        result: (
          <dfn data-tip={`The healing gained from the extra duration that Praetorian's Tidecallers give to Healing Tide Totem and Healing Stream Totem. The increased duration on Healing Stream Totem accounts for ${formatPercentage(tidecallersHSTPercentage)}% healing, the increased duration on Healing Tide Totem for ${formatPercentage(tidecallersHTTPercentage)}% healing.`}>
            {((tidecallersHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber((this.modules.tidecallers.httHealing+this.modules.tidecallers.hstHealing) / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      this.modules.nazjatar.active && {
        id: ITEMS.INTACT_NAZJATAR_MOLTING.id,
        icon: <ItemIcon id={ITEMS.INTACT_NAZJATAR_MOLTING.id} />,
        title: <ItemLink id={ITEMS.INTACT_NAZJATAR_MOLTING.id} />,
        result: (
          <span>
          {nazjatarRiptideResets} Riptide resets 
          </span>
        ),
      },
      this.modules.nobundo.active && {
        id: ITEMS.NOBUNDOS_REDEMPTION.id,
        icon: <ItemIcon id={ITEMS.NOBUNDOS_REDEMPTION.id} />,
        title: <ItemLink id={ITEMS.NOBUNDOS_REDEMPTION.id} />,
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
          <dfn data-tip="The effective healing contributed by the T19 2 set bonus.">
            {((t19_2PHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.t19_2Set.healing / fightDuration * 1000)} HPS
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
            showHealingDone
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
      {
        title: 'Feeding',
        url: 'feeding',
        render: () => (
          <FeedingTab
            cooldownTracker={this.modules.cooldownTracker}
          />
        ),
      },
    ];

    return results;
  }
}

export default CombatLogParser;
