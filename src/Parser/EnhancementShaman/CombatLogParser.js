import React from 'react';

import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Icon from 'common/Icon';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
// import ItemLink from 'common/ItemLink';
// import ItemIcon from 'common/ItemIcon';

import StatisticBox from 'Main/StatisticBox';
import SuggestionsTab from 'Main/SuggestionsTab';
import TalentsTab from 'Main/TalentsTab';
import CastEfficiencyTab from 'Main/CastEfficiencyTab';
import CooldownsTab from 'Main/CooldownsTab';

import MainCombatLogParser from 'Parser/Core/CombatLogParser';
import getCastEfficiency from 'Parser/Core/getCastEfficiency';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

import ManaTab from './Modules/Main/MaelstromTab';

import CooldownTracker from './Modules/Features/CooldownTracker';
import ProcTracker from './Modules/Features/ProcTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';

import SmolderingHeart from './Modules/Legendaries/SmolderingHeart';

import './Modules/Main/main.css';

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
    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownTracker: CooldownTracker,
    procTracker: ProcTracker,

    // Legendaries:
  };

  generateResults() {
    const results = super.generateResults();

    //first row of talents
    const hasWindSong = this.selectedCombatant.hasTalent(SPELLS.WINDSONG_TALENT.id);
    const hasHotHand = this.selectedCombatant.hasTalent(SPELLS.HOT_HAND_TALENT.id);
    const hasLandslide = this.selectedCombatant.hasTalent(SPELLS.LANDSLIDE_TALENT.id);
    //4th row of talents
    const hasHailstorm = this.selectedCombatant.hasTalent(SPELLS.HAILSTORM_TALENT.id);
    //5th row of talents
    const hasOvercharge = this.selectedCombatant.hasTalent(SPELLS.HAILSTORM_TALENT.id);
    //6th row of talents
    const hasCrashingStorm = this.selectedCombatant.hasTalent(SPELLS.CRASHING_STORM_TALENT.id);
    const hasFuryOfAir = this.selectedCombatant.hasTalent(SPELLS.FURY_OF_AIR_TALENT.id);
    const hasSundering = this.selectedCombatant.hasTalent(SPELLS.SUNDERING_TALENT.id);
    //last row of talents
    const hasAscendance = this.selectedCombatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ENHANCEMENT.id);
    const hasEarthenSpike = this.selectedCombatant.hasTalent(SPELLS.EARTHEN_SPIKE_TALENT.id);
    const hasBoulderfist = this.selectedCombatant.hasTalent(SPELLS.BOULDERFIST_TALENT.id);

    const abilityTracker = this.modules.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const flametongue = getAbility(SPELLS.FLAMETONGUE.id);
    const frostbrand = getAbility(SPELLS.FROSTBRAND.id);
    const stormBringer = getAbility(SPELLS.STORMBRINGER.id);

    const fightDuration = this.fightDuration;

	  //uptimes
    const flametongueUptime = this.selectedCombatant.getBuffUptime(SPELLS.FLAMETONGUE_BUFF.id) / this.fightDuration;
    const frostbrandUptime = this.selectedCombatant.getBuffUptime(SPELLS.FROSTBRAND.id) / this.fightDuration;
    const landslideUptime = this.selectedCombatant.getBuffUptime(SPELLS.LANDSLIDE_BUFF.id) / this.fightDuration;
    const furyofairUptime = this.selectedCombatant.getBuffUptime(SPELLS.FURY_OF_AIR.id) / this.fightDuration;

    const nonDpsTimePercentage = this.modules.alwaysBeCasting.totalDamagingTimeWasted / fightDuration;
    const deadTimePercentage = this.modules.alwaysBeCasting.totalTimeWasted / fightDuration;

    const masteryPercent = this.selectedCombatant.masteryPercentage;
    const hastePercent = this.selectedCombatant.hastePercentage;

    //Legendaries
    // const hasUncertainReminder = this.selectedCombatant.hasHead(ITEMS.UNCERTAIN_REMINDER.id);
    // const hasEmalons = this.selectedCombatant.hasChest(ITEMS.EMALONS_CHARGED_CORE.id);
    const hasAkainus = this.selectedCombatant.hasWrists(ITEMS.AKAINUS_ABSOLUTE_JUSTICE.id);
    // const hasSmolderingHeart = this.selectedCombatant.hasHands(ITEMS.SMOLDERING_HEART.id);
    // const hasStorm = this.selectedCombatant.hasWaist(ITEMS.STORM_TEMPESTS.id);
    // const hasRoots = this.selectedCombatant.hasLegs(ITEMS.ROOTS_OF_SHALADRASSIL.id);
    // const hasSpiritual = this.selectedCombatant.hasFeet(ITEMS.SPIRITUAL_JOURNEY.id);
    // const hasSoul = this.selectedCombatant.hasFinger(ITEMS.SOUL_OF_THE_FARSEER.id);
    const hasEOTN = this.selectedCombatant.hasFinger(ITEMS.EYE_OF_THE_TWISTING_NETHER.id);
    // const hasSephuz = this.selectedCombatant.hasFinger(ITEMS.SEPHUZS_SECRET.id);

  this.selectedCombatant._combatantInfo.gear.forEach(function(value) {
    const equippedItem = getItemInfo(value.id);

    if(equippedItem !== undefined && equippedItem.quality === 5) {
      results.items.push({
        item: equippedItem,
        result: (
          <dfn data-tip="">
            Equipped Legendary
          </dfn>
        ),
      });
    }
  });

  //add trinkets to item list
  function getItemInfo(id) {
    //let value = ITEMS.find(item => item.id === id);
    let value;
    Object.keys(ITEMS).some(function(k) {
      if(ITEMS[k].id === id) {
        value = ITEMS[k];
      }
    });

    return value;
  }

    if (nonDpsTimePercentage > 0.3) {
      results.addIssue({
        issue: `Your non DPS time can be improved. Try to cast damaging spells more regularly).`,
        icon: 'petbattle_health-down',
        stat: `${Math.round(nonDpsTimePercentage * 100)}% non DPS time (<30% is recommended)`,
        importance: getIssueImportance(nonDpsTimePercentage, 0.4, 0.45, true),
      });
    }

    if (deadTimePercentage > 0.2) {
      results.addIssue({
        issue: `Your dead GCD time can be improved. Try to Always Be Casting (ABC); cast instant spells during movement phases and focus on having no delays between spell casts`,
        icon: 'spell_mage_altertime',
        stat: `${Math.round(deadTimePercentage * 100)}% dead GCD time (<20% is recommended)`,
        importance: getIssueImportance(deadTimePercentage, 0.35, 1, true),
      });
    }

    if(flametongueUptime < .95) {
		  results.addIssue({
        issue: `Try to make sure the Flametongue buff is always up, when it drops you should refresh it as soon as possible`,
        stat: `Your Flametongue uptime of ${formatPercentage(flametongueUptime)}% is below 95%, try to get as close to 100% as possible`,
        icon: SPELLS.FLAMETONGUE_BUFF.icon,
        importance: getIssueImportance(flametongueUptime, 0.9, 0.8, true),
      });
	  }

	  if(hasHailstorm && frostbrandUptime < .95) {
		  results.addIssue({
        issue: `Try to make sure the Frostbrand buff is always up, when it drops you should refresh it as soon as possible`,
        stat: `Your Frostbrand uptime of ${formatPercentage(frostbrandUptime)}% is below 95%, try to get as close to 100% as possible`,
        icon: SPELLS.FROSTBRAND.icon,
        importance: getIssueImportance(frostbrandUptime, 0.9, 0.8, true),
      });
    } else if(!hasHailstorm && frostbrandUptime > 0) {
    //need to revist Frostbrand without Hailstorm logic
      results.addIssue({
        issue: `Casting Frostbrand without Hailstorm talent is not recommended`,
        icon: SPELLS.FROSTBRAND.icon,
        importance: ISSUE_IMPORTANCE.MAJOR,
      });
    }

    if(hasLandslide && landslideUptime < .95) {
      results.addIssue({
        issue: `Try to make sure the Landslide buff from Rockbiter is always up, when it drops you should refresh it as soon as possible`,
        stat: `Your Landslide uptime of ${formatPercentage(landslideUptime)}% is below 95%, try to get as close to 100% as possible`,
        icon: SPELLS.LANDSLIDE_BUFF.icon,
        importance: getIssueImportance(landslideUptime, 0.9, 0.8, true),
      });
    }

    if(hasFuryOfAir && furyofairUptime < .95) {
      results.addIssue({
        issue: `Try to make sure the Fury of Air buff is always up, when it drops you should refresh it as soon as possible`,
        stat: `Your Fury of Air uptime of ${formatPercentage(furyofairUptime)}% is below 95%, try to get as close to 100% as possible`,
        icon: SPELLS.FURY_OF_AIR.icon,
        importance: getIssueImportance(furyofairUptime, 0.9, 0.85, true),
      });
    }

    const castEfficiencyCategories = SPELL_CATEGORY;
    const castEfficiency = getCastEfficiency(CPM_ABILITIES, this);
    castEfficiency.forEach((cpm) => {
      if (cpm.canBeImproved && !cpm.ability.noSuggestion) {
        results.addIssue({
          issue: <span>Try to cast <SpellLink id={cpm.ability.spell.id} /> more often. {cpm.ability.extraSuggestion || ''}</span>,
          stat: `${cpm.casts} out of ${cpm.maxCasts} possible casts; ${Math.round(cpm.castEfficiency * 100)}% cast efficiency (>${cpm.recommendedCastEfficiency * 100}% is recommended)`,
          icon: cpm.ability.spell.icon,
          importance: cpm.ability.importance || getIssueImportance(cpm.castEfficiency, cpm.recommendedCastEfficiency - 0.05, cpm.recommendedCastEfficiency - 0.15),
        });
      }
    });

    //setup notworthyitems

    results.statistics = [
      <StatisticBox
        icon={ <Icon icon="class_shaman" alt="DPS stats" /> }
        value={`${formatNumber(this.totalDamageDone / this.fightDuration * 1000)} DPS`}
        label={(
          <dfn data-tip={`The total damage done recorded was ${formatThousands(this.totalDamageDone)}.`}>
            Damage done
          </dfn>
        )}
      />,
	  <StatisticBox
        icon={<Icon icon="spell_mage_altertime" alt="Dead GCD time" />}
        value={`${formatPercentage(deadTimePercentage)} %`}
        label={(
          <dfn data-tip="Dead GCD time is available casting time not used. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/stunned), etc.">
            Dead GCD time
          </dfn>
        )}
      />,
      <StatisticBox
          icon={<Icon icon="spell_nature_shamanrage" alt="Core Stats" />}
          value={`${formatPercentage(masteryPercent)} % M ${formatPercentage(hastePercent)} % H`}
          label={(
              <dfn data-tip={`Mastery is ${formatPercentage(masteryPercent)} % and Haste is ${formatPercentage(hastePercent)} %`}>
                  Core Secondary Stats
          </dfn>
          )}
      />,
	  <StatisticBox
        icon={<SpellIcon id={SPELLS.FLAMETONGUE_BUFF.id} />}
        value={`${formatPercentage(flametongueUptime)} %`}
        label={(
          <dfn data-tip={`Goal should be 98-100% uptime`}>
            Flametongue Uptime
          </dfn>
        )}
      />,
    ];

    results.items = [
      ...results.items,
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
        title: 'Talents',
        url: 'talents',
        render: () => (
          <TalentsTab combatant={this.selectedCombatant} />
        ),
      },
      // {
      //   title: 'Cooldowns',
      //   url: 'cooldowns',
      //   render: () => (
      //     <CooldownsTab
      //       fightStart={this.fight.start_time}
      //       fightEnd={this.fight.end_time}
      //       cooldowns={this.modules.cooldownTracker.pastCooldowns}
      //       showOutputStatistics
      //     />
      //   ),
      // },
      {
        title: 'Procs',
        url: 'procs',
        render: () => (
          <CooldownsTab
            fightStart={this.fight.start_time}
            fightEnd={this.fight.end_time}
            cooldowns={this.modules.procTracker.pastCooldowns}
            showOutputStatistics
          />
        ),
      },
      {
          title: 'Maelstrom',
          url: 'maelstrom',
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
