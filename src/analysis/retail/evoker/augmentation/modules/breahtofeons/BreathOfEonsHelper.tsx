import React from 'react';
import { BreathOfEonsWindows } from './BreathOfEonsRotational';
import { SubSection } from 'interface/guide';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/evoker';
import '../Styling.scss';
import LazyLoadGuideSection from 'analysis/retail/evoker/shared/modules/components/LazyLoadGuideSection';
import { fetchEvents } from 'common/fetchWclApi';
import CombatLogParser from '../../CombatLogParser';
import { DamageEvent } from 'parser/core/Events';
import { ABILITY_BLACKLIST } from '../../constants';
import OptimalWindow from './OptimalWindow';

export type DamageTable = {
  table: DamageEvent[];
  start: number;
  end: number;
};

export type DamageSources = {
  sourceID: number;
  damage: number;
  lostDamage: number;
};

type Props = {
  windows: BreathOfEonsWindows[];
  fightStartTime: number;
  fightEndTime: number;
  owner: CombatLogParser;
};

const debug = false;

export type DamageWindow = {
  start: number;
  end: number;
  sum: number;
  startFormat: string;
  endFormat: string;
  sumSources: DamageSources[];
};

const BreathOfEonsHelper: React.FC<Props> = ({ windows, fightStartTime, fightEndTime, owner }) => {
  const damageTables: DamageTable[] = [];

  /** Generate filter based on black list and whitelist
   * For now we only look at the players who were buffed
   * during breath */
  function getFilter() {
    const abilityFilter = ABILITY_BLACKLIST.map((id) => `${id}`).join(', ');

    const filter = `type = "damage" 
    AND not ability.id in (${abilityFilter}) 
    AND (target.id != source.id)
    AND target.id not in(169428, 169430, 169429, 169426, 169421, 169425, 168932)
    AND not (target.id = source.owner.id)
    AND not (supportedActor.id = target.id)
    AND not (source.id = target.owner.id)
    AND source.disposition = "friendly"
    AND target.disposition != "friendly"
    AND (source.id > 0)`;

    if (debug) {
      console.log(filter);
    }
    return filter;
  }

  const buffer = 4000;

  async function loadData() {
    /** High maxPage allowances needed otherwise it breaks */
    for (const window of windows) {
      const startTime =
        window.start - buffer > fightStartTime ? window.start - buffer : fightStartTime;
      const endTime = window.end + buffer < fightEndTime ? window.end + buffer : fightEndTime;
      const windowEvents = (await fetchEvents(
        owner.report.code,
        startTime,
        endTime,
        undefined,
        getFilter(),
        40,
      )) as DamageEvent[];
      damageTables.push({
        table: windowEvents,
        start: window.start,
        end: window.end,
      });
    }
  }

  const optimalWindow = () => {
    return (
      <OptimalWindow
        fightEndTime={fightEndTime}
        fightStartTime={fightStartTime}
        owner={owner}
        windows={windows}
        damageTables={damageTables}
        buffer={buffer}
      />
    );
  };

  return (
    <SubSection title="Breath of Eons helper">
      <p>
        This module offers a detailed damage breakdown of your{' '}
        <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} /> usage.
        <br />
        Additionally, it helps you determine if there was a more optimal timing for your{' '}
        <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} />. This can be particularly valuable when
        dealing with bursty specs like <span className="DeathKnight">Unholy Death Knights</span>,{' '}
        <span className="Warlock">Demonology Warlocks</span>, or{' '}
        <span className="Mage">Arcane Mages</span>.
      </p>

      <LazyLoadGuideSection loader={loadData.bind(this)} value={optimalWindow.bind(this)} />
    </SubSection>
  );
};

export default BreathOfEonsHelper;
