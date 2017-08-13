import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Icon from 'common/Icon';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';
// Currently Unused
// import ITEMS from 'common/ITEMS';
// import ItemLink from 'common/ItemLink';
// import ItemIcon from 'common/ItemIcon';

import StatisticBox from 'Main/StatisticBox';
import SuggestionsTab from 'Main/SuggestionsTab';
import TalentsTab from 'Main/TalentsTab';
import CastEfficiencyTab from 'Main/CastEfficiencyTab';
import MainCombatLogParser from 'Parser/Core/CombatLogParser';
import getCastEfficiency from 'Parser/Core/getCastEfficiency';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

import Gore from './Modules/Features/Gore';
import GalacticGuardian from './Modules/Features/GalacticGuardian';
import GuardianOfElune from './Modules/Features/GuardianOfElune';
import DualDetermination from './Modules/Items/DualDetermination';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';

import CPM_ABILITIES, { SPELL_CATEGORY } from './CPM_ABILITIES';

function getIssueImportance(value, regular, major, higherIsWorse = false) {
  if (higherIsWorse ? value > major : value < major) {
    return ISSUE_IMPORTANCE.MAJOR;
  }
  if (higherIsWorse ? value > regular : value < regular) {
    return ISSUE_IMPORTANCE.REGULAR;
  }
  return ISSUE_IMPORTANCE.MINOR;
}

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    // Features
    alwaysBeCasting: AlwaysBeCasting,
    goreProcs: Gore,
    galacticGuardianProcs: GalacticGuardian,
    guardianOfEluneProcs: GuardianOfElune,

    // Legendaries:
    dualDetermination: DualDetermination,
  };

  generateResults() {
    const results = super.generateResults();

    const fightDuration = this.fightDuration;

    const nonDpsTimePercentage = this.modules.alwaysBeCasting.totalDamagingTimeWasted / fightDuration;
    const deadTimePercentage = this.modules.alwaysBeCasting.totalTimeWasted / fightDuration;
    const unusedGoreProcs = 1 - (this.modules.goreProcs.consumedGoreProc / this.modules.goreProcs.GoreProcsTotal);
    const unusedGGProcs = 1 - (this.modules.galacticGuardianProcs.consumedGGProc / this.modules.galacticGuardianProcs.GGProcsTotal);
    const unusedGoEProcs = 1 - (this.modules.guardianOfEluneProcs.consumedGoEProc / this.modules.guardianOfEluneProcs.GoEProcsTotal);

    const thrashUptimePercentage = this.modules.enemies.getBuffUptime(SPELLS.THRASH_BEAR_DOT.id) / this.fightDuration;
    const moonfireUptimePercentage = this.modules.enemies.getBuffUptime(SPELLS.MOONFIRE_BEAR.id) / this.fightDuration;

    const totalIronFurTime = this.selectedCombatant.getBuffUptime(SPELLS.IRONFUR.id);
    const pulverizeUptimePercentage = this.selectedCombatant.getBuffUptime(SPELLS.PULVERIZE_BUFF.id) / this.fightDuration;
    
    if (nonDpsTimePercentage > 0.3) {
      results.addIssue({
        issue: `Your non DPS time can be improved. Try to cast damaging spells more regularly.`,
        stat: `${Math.round(nonDpsTimePercentage * 100)}% non DPS time (<30% is recommended)`,
        icon: 'petbattle_health-down',
        importance: getIssueImportance(nonDpsTimePercentage, 0.4, 0.45, true),
      });
    }
    if (deadTimePercentage > 0.2) {
      results.addIssue({
        issue: `Your dead GCD time can be improved. Try to Always Be Casting (ABC).`,
        stat: `${Math.round(deadTimePercentage * 100)}% dead GCD time (<20% is recommended)`,
        icon: 'spell_mage_altertime',
        importance: getIssueImportance(deadTimePercentage, 0.35, 0.4, true),
      });
    }
    if (unusedGoreProcs > 0.30) {
      results.addIssue({
        issue: <span>Your <SpellLink id={SPELLS.GORE_BEAR.id} /> procs should be used as soon as you get them so they are not overwritten.</span>,
        stat: `${(this.modules.goreProcs.GoreProcsTotal - this.modules.goreProcs.consumedGoreProc)}/${(this.modules.goreProcs.GoreProcsTotal)} (${formatPercentage((this.modules.goreProcs.GoreProcsTotal - this.modules.goreProcs.consumedGoreProc) / this.modules.goreProcs.GoreProcsTotal)}%) procs were missed (<30% is recommended)`,
        icon: SPELLS.GORE_BEAR.icon,
        importance: getIssueImportance(unusedGoreProcs, 0.45, 0.6, true),
      });
    }
    if (unusedGGProcs > 0.30) {
      results.addIssue({
        issue: <span>Your <SpellLink id={SPELLS.GALACTIC_GUARDIAN.id} /> procs should be used as soon as you get them so they are not overwritten.</span>,
        stat: `${(this.modules.galacticGuardianProcs.GGProcsTotal - this.modules.galacticGuardianProcs.consumedGGProc)}/${(this.modules.galacticGuardianProcs.GGProcsTotal)} (${formatPercentage((this.modules.galacticGuardianProcs.GGProcsTotal - this.modules.galacticGuardianProcs.consumedGGProc) / this.modules.galacticGuardianProcs.GGProcsTotal)}%) procs were missed (<30% is recommended)`,
        icon: SPELLS.GALACTIC_GUARDIAN.icon,
        importance: getIssueImportance(unusedGGProcs, 0.45, 0.6, true),
      });
    }
    if (unusedGoEProcs > 0.30) {
      results.addIssue({
        issue: <span>Your <SpellLink id={SPELLS.GUARDIAN_OF_ELUNE.id} /> procs should be used as soon as you get them so they are not overwritten.</span>,
        stat: `${(this.modules.guardianOfEluneProcs.GoEProcsTotal - this.modules.guardianOfEluneProcs.consumedGoEProc)}/${(this.modules.guardianOfEluneProcs.GoEProcsTotal)} (${formatPercentage((this.modules.guardianOfEluneProcs.GoEProcsTotal - this.modules.guardianOfEluneProcs.consumedGoEProc) / this.modules.guardianOfEluneProcs.GoEProcsTotal)}%) procs were missed (<30% recommended)`,
        icon: SPELLS.GUARDIAN_OF_ELUNE.icon,
        importance: getIssueImportance(unusedGoEProcs, 0.45, 0.6, true),
      });
    }

    if (thrashUptimePercentage < 0.95) {
      results.addIssue({
        issue: <span> Your <SpellLink id={SPELLS.THRASH_BEAR_DOT.id} /> uptime should be near 100%, unless you have extended periods of downtime. Thrash applies a bleed which buffs the damage of <SpellLink id={SPELLS.MANGLE_BEAR.id} /> by 20%.  Thrash uptime is especially important if you are talented into <SpellLink id={SPELLS.REND_AND_TEAR_TALENT.id} />, since it buffs the rest of your damage and gives you extra damage reduction.</span>,
        stat: `${formatPercentage(thrashUptimePercentage)}% uptime (>95% recommended)`,
        icon: SPELLS.THRASH_BEAR.icon,
        importance: getIssueImportance(thrashUptimePercentage, 0.9, 0.8),
      });
    }

    if (moonfireUptimePercentage < 0.95) {
      results.addIssue({
        issue: <span> Your <SpellLink id={SPELLS.MOONFIRE_BEAR.id} /> uptime should be near 100%, unless you have extended periods of downtime. Targets with Moonfire applied to them deal less damage to you due to <SpellLink id={SPELLS.SCINTILLATING_MOONLIGHT.id} />.</span>,
        stat: `${formatPercentage(moonfireUptimePercentage)}% uptime (>95% recommended)`,
        icon: SPELLS.MOONFIRE_BEAR.icon,
        importance: getIssueImportance(moonfireUptimePercentage, 0.9, 0.8),
      });
    }

    if (this.selectedCombatant.hasTalent(SPELLS.PULVERIZE_TALENT.id) && pulverizeUptimePercentage < 0.9) {
      results.addIssue({
        issue: <span> Your <SpellLink id={SPELLS.PULVERIZE_TALENT.id} /> uptime should be near 100%, unless there are extended periods of downtime. All targets deal less damage to you due to the <SpellLink id={SPELLS.PULVERIZE_BUFF.id} /> buff.</span>,
        stat: `${formatPercentage(pulverizeUptimePercentage)}% uptime (>90% recommended)`,
        icon: SPELLS.PULVERIZE_TALENT.icon,
        importance: getIssueImportance(pulverizeUptimePercentage, 0.9, 0.75),
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

    results.statistics = [
      <StatisticBox
        icon={<Icon icon="class_druid" alt="Damage taken" />}
        value={`${formatNumber(this.totalDamageTaken / this.fightDuration * 1000)} DTPS`}
        label={(
          <dfn data-tip={`The total damage taken was ${formatThousands(this.totalDamageTaken)}.`}>
            Damage taken
          </dfn>
        )}
      />,
      <StatisticBox
        icon={(
          <img
            src="/img/healing.png"
            style={{ border: 0 }}
            alt="Healing"
          />
        )}
        value={`${formatNumber(this.totalHealing / this.fightDuration * 1000)} HPS`}
        label={(
          <dfn data-tip={`The total healing done was ${formatThousands(this.totalHealing)}.`}>
            Healing done
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
        icon={<Icon icon="class_druid" alt="Damage done" />}
        value={`${formatNumber(this.totalDamageDone / this.fightDuration * 1000)} DPS`}
        label={(
          <dfn data-tip={`The total damage done was ${formatThousands(this.totalDamageDone)}.`}>
            Damage done
          </dfn>
        )}
      />,
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GORE_BEAR.id} />}
        value={`${formatPercentage(unusedGoreProcs)}%`}
        label={(
          <dfn data-tip={`You got total <b>${this.modules.goreProcs.GoreProcsTotal}</b> gore procs and <b>used ${this.modules.goreProcs.consumedGoreProc}</b> of them.`}>
            Unused Gore Procs
          </dfn>
        )}
      />,
      this.modules.galacticGuardianProcs.active && (<StatisticBox
        icon={<SpellIcon id={SPELLS.GALACTIC_GUARDIAN.id} />}
        value={`${formatPercentage(unusedGGProcs)}%`}
        label={(
          <dfn data-tip={`You got total <b>${this.modules.galacticGuardianProcs.GGProcsTotal}</b> galactic guardian procs and <b>used ${this.modules.galacticGuardianProcs.consumedGGProc}</b> of them.`}>
            Unused Galactic Guardian
          </dfn>
        )}
      />),
      this.modules.guardianOfEluneProcs.active && (<StatisticBox
        icon={<SpellIcon id={SPELLS.GUARDIAN_OF_ELUNE.id} />}
        value={`${formatPercentage(unusedGoEProcs)}%`}
        label={(
          <dfn data-tip={`You got total <b>${this.modules.guardianOfEluneProcs.GoEProcsTotal}</b> guardian of elune procs and <b>used ${this.modules.guardianOfEluneProcs.consumedGoEProc}</b> of them.`}>
            Unused Guardian of Elune
          </dfn>
        )}
      />),
      this.modules.guardianOfEluneProcs.active && (<StatisticBox
        icon={<SpellIcon id={SPELLS.FRENZIED_REGENERATION.id} />}
        value={`${formatPercentage(this.modules.guardianOfEluneProcs.nonGoEFRegen/(this.modules.guardianOfEluneProcs.nonGoEFRegen + this.modules.guardianOfEluneProcs.GoEFRegen))}%`}
        label={(
          <dfn data-tip={`You cast <b>${this.modules.guardianOfEluneProcs.nonGoEFRegen + this.modules.guardianOfEluneProcs.GoEFRegen}</b> total ${SPELLS.FRENZIED_REGENERATION.name} and <b> ${this.modules.guardianOfEluneProcs.GoEFRegen} were buffed by 25%</b>.`}>
            Unbuffed Frenzied Regen
          </dfn>
        )}
      />),
      this.modules.guardianOfEluneProcs.active && (<StatisticBox
        icon={<SpellIcon id={SPELLS.IRONFUR.id} />}
        value={`${formatPercentage(this.modules.guardianOfEluneProcs.nonGoEIronFur/(this.modules.guardianOfEluneProcs.nonGoEIronFur + this.modules.guardianOfEluneProcs.GoEIronFur))}%`}
        label={(
          <dfn data-tip={`You cast <b>${this.modules.guardianOfEluneProcs.nonGoEIronFur + this.modules.guardianOfEluneProcs.GoEIronFur}</b> total ${SPELLS.IRONFUR.name} and <b> ${this.modules.guardianOfEluneProcs.GoEIronFur} were buffed by 25%</b>.`}>
            Unbuffed Ironfur
          </dfn>
        )}
      />),
      <StatisticBox
        icon={<SpellIcon id={SPELLS.IRONFUR.id} />}
        value={`${formatPercentage(totalIronFurTime/fightDuration)}%`}
        label={(
          <dfn>
            Total Ironfur uptime
          </dfn>
        )}
      />,
      <StatisticBox
        icon={<SpellIcon id={SPELLS.THRASH_BEAR.id} />}
        value={`${formatPercentage(thrashUptimePercentage)}%`}
        label="Thrash uptime"
      />,
      <StatisticBox
        icon={<SpellIcon id={SPELLS.MOONFIRE_BEAR.id} />}
        value={`${formatPercentage(moonfireUptimePercentage)}%`}
        label="Moonfire uptime"
      />,

      this.selectedCombatant.hasTalent(SPELLS.PULVERIZE_TALENT.id) && (<StatisticBox
        icon={<SpellIcon id={SPELLS.PULVERIZE_TALENT.id} />}
        value={`${formatPercentage(pulverizeUptimePercentage)}%`}
        label="Pulverize uptime"
      />),
  ];

    // TODO: Items

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
    ];

    return results;
  }
}

export default CombatLogParser;
