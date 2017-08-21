import React from 'react';

import SpellIcon from 'common/SpellIcon';
import Icon from 'common/Icon';
// import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
// import ItemLink from 'common/ItemLink';
// import ItemIcon from 'common/ItemIcon';

import StatisticBox from 'Main/StatisticBox';
import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';

import MainCombatLogParser from 'Parser/Core/CombatLogParser';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

import Maelstrom from './Modules/Main/Maelstrom';

import CastEfficiency from './Modules/Features/CastEfficiency';
import CooldownTracker from './Modules/Features/CooldownTracker';
import ProcTracker from './Modules/Features/ProcTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';

import './Modules/Main/main.css';

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
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownTracker: CooldownTracker,
    procTracker: ProcTracker,

    // Legendaries:
  };

  generateResults() {
    const results = super.generateResults();
    
    // const hasElementalBlast = this.selectedCombatant.hasTalent(SPELLS.ELEMENTAL_BLAST_TALENT.id);
    // const hasEchosElements = this.selectedCombatant.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id);
    // const hasAscendance = this.selectedCombatant.hasTalent(SPELLS.ASCENDANCE_ELEMENTAL_TALENT.id);
    // const hasLightningRod = this.selectedCombatant.hasTalent(SPELLS.LIGHTNING_ROD.id);
    const hasIcefury = this.selectedCombatant.hasTalent(SPELLS.ICEFURY_TALENT.id);
    
    const abilityTracker = this.modules.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    // const lavaBurst = getAbility(SPELLS.LAVA_BURST.id);
    // const lightningBolt = getAbility(SPELLS.LIGHTNING_BOLT.id);
    // const elementalBlast = getAbility(SPELLS.ELEMENTAL_BLAST.id);
    const overloadLavaBurst = getAbility(SPELLS.LAVA_BURST_OVERLOAD.id);
    const overloadLightningBolt = getAbility(SPELLS.LIGHTNING_BOLT_OVERLOAD_HIT.id);
    const overloadElementalBlast = getAbility(SPELLS.ELEMENTAL_BLAST_OVERLOAD.id);
    const overloadChainLightning = getAbility(SPELLS.CHAIN_LIGHTNING_OVERLOAD.id);
    const overloadIcefury = hasIcefury && getAbility(SPELLS.ICEFURY_OVERLOAD.id);

    const fightDuration = this.fightDuration;

    const elementalBlastHasteUptime = this.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_BLAST_HASTE.id) / this.fightDuration;
    const elementalBlastCritUptime = this.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_BLAST_CRIT.id) / this.fightDuration;
    const elementalBlastMasteryUptime = this.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_BLAST_MASTERY.id) / this.fightDuration;

    const elementalBlastUptime = (elementalBlastHasteUptime + elementalBlastCritUptime + elementalBlastMasteryUptime);
    // const flameShockUptime = this.selectedCombatant.getBuffUptime(SPELLS.FLAME_SHOCK.id) / this.fightDuration;

    const nonDpsTimePercentage = this.modules.alwaysBeCasting.totalDamagingTimeWasted / fightDuration;
    const deadTimePercentage = this.modules.alwaysBeCasting.totalTimeWasted / fightDuration;

    if (nonDpsTimePercentage > 0.3) {
      results.addIssue({
        issue: `[NYI] Your non DPS time can be improved. Try to cast damaging spells more regularly (${Math.round(nonDpsTimePercentage * 100)}% non DPS time).`,
        icon: 'petbattle_health-down',
        importance: getIssueImportance(nonDpsTimePercentage, 0.4, 0.45, true),
      });
    }
    if (deadTimePercentage > 0.2) {
      results.addIssue({
        issue: `Your dead GCD time can be improved. (${Math.round(deadTimePercentage * 100)}% dead GCD time).`,
        icon: 'spell_mage_altertime',
        importance: getIssueImportance(deadTimePercentage, 0.35, 0.4, true),
      });
    }

    results.statistics = [
      <StatisticBox
        icon={ <Icon icon="class_shaman" alt="Dead GCD time" /> }
        value={formatNumber(this.modules.damageDone.total.effective)}
        label={(
          <dfn data-tip="Without Fire Elemental Damage.">
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
        icon={<SpellIcon id={SPELLS.ELEMENTAL_MASTERY.id} />}
        value={(
          <span className='flexJustify'>
            <span>
              <SpellIcon
                id={SPELLS.LAVA_BURST_OVERLOAD.id}
                style={{
                  height: '1.3em',
                  marginTop: '-.1em',
                }}
              />
              {overloadLavaBurst.damangeHits}{' '}
            </span>
            {' '}
            <span>
              <SpellIcon
                id={SPELLS.LIGHTNING_BOLT_OVERLOAD_HIT.id}
                style={{
                  height: '1.3em',
                  marginTop: '-.1em',
                }}
              />
              {overloadLightningBolt.damangeHits}{' '}
            </span>
            {' '}
            <span>
              <SpellIcon
                id={SPELLS.ELEMENTAL_BLAST_OVERLOAD.id}
                style={{
                  height: '1.3em',
                  marginTop: '-.1em',
                }}
              />
              {overloadElementalBlast.damangeHits}{' '}
            </span>
            {' '}
            <span className="hideWider1200">
              <SpellIcon
                id={SPELLS.CHAIN_LIGHTNING_OVERLOAD.id}
                style={{
                  height: '1.3em',
                  marginTop: '-.1em',
                }}
              />
              {overloadChainLightning.damangeHits}{' '}
            </span>
            { hasIcefury &&
              <span className="hideWider1200">
                <SpellIcon
                  id={SPELLS.ICEFURY_OVERLOAD.id}
                  style={{
                    height: '1.3em',
                    marginTop: '-.1em',
                  }}
                />
                {overloadIcefury ? overloadIcefury.damangeHits : '-' }{' '}
              </span>
            }
          </span>
        )}
        label={'Overload procs'}
      />,
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ELEMENTAL_BLAST.id} />}
        value={`${formatPercentage(elementalBlastUptime)} %`}
        label={(
          <dfn data-tip={`With <b class="stat-mastery">${formatPercentage(elementalBlastMasteryUptime)}% Mastery</b>, <b class="stat-criticalstrike">${formatPercentage(elementalBlastCritUptime)}% Crit</b>, <b  class="stat-haste">${formatPercentage(elementalBlastHasteUptime)}% Haste</b> Uptime`}>
            Uptime
          </dfn>
        )}
      />,
      ...results.statistics,
    ];

    results.items = [
      ...results.items,
      /*TODO*/
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
        title: 'Maelstrom',
        url: 'maelstrom',
        render: () => (
          <Tab title="Maelstrom" style={{ padding: '15px 22px' }}>
            <Maelstrom
              reportCode={this.report.code}
              actorId={this.playerId}
              start={this.fight.start_time}
              end={this.fight.end_time}
            />
          </Tab>
        ),
      },
      ...results.tabs,
    ];

    return results;
  }
}

export default CombatLogParser;
