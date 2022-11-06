import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import Events, { CastEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventHistory from 'parser/shared/modules/EventHistory';
import StatTracker from 'parser/shared/modules/StatTracker';
import GlobalCooldown from '../core/GlobalCooldown';
import Atonement from '../spells/Atonement';
import Evangelism from '../spells/Evangelism';
import Haste from 'parser/shared/modules/Haste';
import { ControlledExpandable, Icon, SpellLink, Tooltip } from 'interface';

import './EvangelismAnalysis.scss';
import { useState } from 'react';

const ALLOWED_PRE_EVANG = [
  TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT.id,
  SPELLS.POWER_WORD_SHIELD.id,
  TALENTS_PRIEST.RENEW_TALENT.id,
  SPELLS.FLASH_HEAL.id,
  TALENTS_PRIEST.RAPTURE_TALENT.id,
  TALENTS_PRIEST.SHADOWFIEND_TALENT.id,
  TALENTS_PRIEST.EVANGELISM_TALENT.id,
  SPELLS.SHADOW_WORD_PAIN.id,
  TALENTS_PRIEST.PURGE_THE_WICKED_TALENT.id,
];

const PEMITTED_RAMP_STARTERS = [
  SPELLS.SHADOW_WORD_PAIN.id,
  TALENTS_PRIEST.PURGE_THE_WICKED_TALENT.id,
  TALENTS_PRIEST.RENEW_TALENT.id,
  SPELLS.FLASH_HEAL.id,
  TALENTS_PRIEST.RAPTURE_TALENT.id,
  SPELLS.POWER_WORD_SHIELD.id,
];

interface Ramp {
  timestamp: number;
  rampHistory: CastEvent[];
  badCastIndexes?: number[];
}

class EvangelismAnalysis extends Analyzer {
  static dependencies = {
    atonementModule: Atonement,
    eventHistory: EventHistory,
    globalCooldown: GlobalCooldown,
    statTracker: StatTracker,
    evangelism: Evangelism,
    haste: Haste,
  };

  protected eventHistory!: EventHistory;
  protected atonementModule!: Atonement;
  protected globalCooldown!: GlobalCooldown;
  protected statTracker!: StatTracker;
  protected evangelism!: Evangelism;
  protected haste!: Haste;

  ramps: Ramp[] = [];

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.EVANGELISM_TALENT),
      this.buildSequence,
    );
  }

  // groups all the casts just before you cast evangelism
  buildSequence(event: CastEvent) {
    const rampHistory = this.eventHistory
      .last(30, 17000, Events.cast.by(SELECTED_PLAYER))
      .filter(
        (cast) =>
          !CASTS_THAT_ARENT_CASTS.includes(cast.ability.guid) &&
          this.globalCooldown.isOnGlobalCooldown(cast.ability.guid),
      );
    rampHistory.push(event);

    this.ramps.push({ timestamp: event.timestamp, rampHistory: rampHistory });
    this.cutSequence(rampHistory);
  }

  // figures out where the "ramp" actually starts
  cutSequence(ramp: CastEvent[]) {
    while (!PEMITTED_RAMP_STARTERS.includes(ramp[0].ability.guid)) {
      ramp.shift();
    }
    this.analyzeSequence(ramp);
  }

  analyzeSequence(ramp: CastEvent[]) {
    // check that only buttons to press pre evangelism were used
    this.ramps[this.ramps.length - 1].badCastIndexes = this.checkForWrongCasts(ramp);

    // TODO: check for downtime
  }

  checkForWrongCasts(ramp: CastEvent[]) {
    return ramp
      .map((cast, index) => {
        if (!ALLOWED_PRE_EVANG.includes(cast.ability.guid)) {
          return index;
        }
        return null;
      })
      .filter(Number) as number[];
  }

  get guideCastBreakdown() {
    return this.ramps.map((ramp, ix) => {
      const [isExpanded, setIsExpanded] = useState(false);

      const header = (
        <>
          @ {this.owner.formatTimestamp(ramp.timestamp)}{' '}
          <SpellLink id={TALENTS_PRIEST.EVANGELISM_TALENT.id} />
        </>
      );

      const badCastTooltip = (index: number) => (
        <>
          Casting a spell like <SpellLink id={ramp.rampHistory[index].ability.guid} /> is not
          recommended while ramping. Make sure to mostly focus on applying{' '}
          <SpellLink id={TALENTS_PRIEST.ATONEMENT_TALENT.id} /> when ramping.
        </>
      );

      const spellSequence = ramp.rampHistory.map((cast, index) => {
        const tooltipContent = (
          <>{ramp.badCastIndexes?.includes(index) ? badCastTooltip(index) : 'No issues found'}</>
        );
        const iconClass = `evang__icon ${ramp.badCastIndexes?.includes(index) ? '--fail' : ''}`;
        return (
          <Tooltip content={tooltipContent} key={index} direction="up">
            <div className="" data-place="top">
              <Icon icon={cast.ability.abilityIcon} className={iconClass} />
            </div>
          </Tooltip>
        );
      });

      const badCastOverview =
        ramp.badCastIndexes?.length && ramp.badCastIndexes?.length > 0 ? (
          <>
            <div>
              You cast {ramp.badCastIndexes?.length || 0} spells which are not optimally used while
              ramping. Highlight here to see which spells these were.
            </div>
          </>
        ) : null;

      const problemOverview = (
        <>
          <div>{badCastOverview}</div>
        </>
      );

      const noProblems = (
        <>
          <div>
            No major issues detected, however if you think there should be, please let us know!
          </div>
        </>
      );

      return (
        <ControlledExpandable
          header={header}
          element="section"
          expanded={isExpanded}
          inverseExpanded={() => setIsExpanded(!isExpanded)}
          key={ix}
        >
          <div className="evang__cast-list">{spellSequence}</div>
          {ramp.badCastIndexes?.length && ramp.badCastIndexes?.length > 0
            ? problemOverview
            : noProblems}
        </ControlledExpandable>
      );
    });
  }
}

export default EvangelismAnalysis;
