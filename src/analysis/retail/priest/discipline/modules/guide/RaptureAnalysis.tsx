import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventHistory from 'parser/shared/modules/EventHistory';
import StatTracker from 'parser/shared/modules/StatTracker';
import GlobalCooldown from '../core/GlobalCooldown';
import Atonement from '../spells/Atonement';
import Evangelism from '../spells/Evangelism';
import Haste from 'parser/shared/modules/Haste';
import { ControlledExpandable, Icon, SpellLink, Tooltip } from 'interface';

import { useState } from 'react';
import { PassFailCheckmark } from 'interface/guide';
import { ATONEMENT_DAMAGE_SOURCES } from '../../constants';
import PassFailBar from 'interface/guide/components/PassFailBar';
import { abilityToSpell } from 'common/abilityToSpell';

const ALLOWED_PRE_RAPTURE = [
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

const PERMITTED_RAMP_STARTERS = [
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
  damageRotation: CastEvent[];
}

class RaptureAnalysis extends Analyzer {
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
  finishedRamping = false;
  radianceCounter = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.RAPTURE_TALENT),
      this.onRaptureCast,
    );

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.buildSequence);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.fillDpsRotation);
  }

  // groups all the casts just before you cast evangelism
  onRaptureCast(event: CastEvent) {
    this.ramps.push({ timestamp: event.timestamp, rampHistory: [], damageRotation: [] });
    this.finishedRamping = false;
    this.radianceCounter = 0;
  }

  // Need to build to the end of the ramp - be it the end of the rapture buff + two radiance casts, or if the buff is ended early by 2 radiances.
  // If the sequence is too short, the damage rotation at the end will be cut by cleanupRamp().

  buildSequence(event: CastEvent) {
    if (this.ramps.length < 1) {
      return;
    }
    if (!this.globalCooldown.isOnGlobalCooldown(event.ability.guid)) {
      return;
    }

    if (
      event.ability.guid === TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT.id &&
      !this.finishedRamping
    ) {
      this.currentRamp.rampHistory.push(event);
      this.radianceCounter += 1;
      return;
    }

    if (this.radianceCounter > 1) {
      this.finishedRamping = true;
      this.cleanupRamp();
      return;
    }

    if (this.currentRamp.timestamp + 12000 > event.timestamp) {
      this.currentRamp.rampHistory.push(event);
    } else {
      this.finishedRamping = true;
      this.cleanupRamp();
    }
  }

  // gets your spells cast 10s after pressing evangelism.
  fillDpsRotation(event: CastEvent) {
    if (this.ramps.length < 1 || !this.finishedRamping) {
      return;
    }

    const lastRampCast = this.currentRamp.rampHistory[this.currentRamp.rampHistory.length - 1];
    if (event.timestamp < lastRampCast.timestamp + 10000) {
      this.currentRamp.damageRotation.push(event);
    }
  }

  // edits the ramp history array to only include the applicators(or bad damage casts if there are damage casts in between)
  cleanupRamp() {
    let radCasted = false;
    this.currentRamp.rampHistory.forEach((rampCast, ix) => {
      if (rampCast.ability.guid === TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT.id) {
        radCasted = true;
        return;
      }
      if (radCasted && rampCast.ability.guid !== TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT.id) {
        this.currentRamp.rampHistory.splice(ix);
      }
    });

    this.cutSequence(this.currentRamp.rampHistory);
  }

  // figures out where the "ramp" actually starts
  cutSequence(ramp: CastEvent[]) {
    while (!PERMITTED_RAMP_STARTERS.includes(ramp[0].ability.guid)) {
      ramp.shift();
    }
    this.analyzeSequence(ramp);
  }

  analyzeSequence(ramp: CastEvent[]) {
    // check that only buttons to press pre evangelism were used
    this.currentRamp.badCastIndexes = this.checkForWrongCasts(ramp);
    // TODO: check for downtime
  }

  checkForWrongCasts(ramp: CastEvent[]) {
    return ramp
      .map((cast, index) => {
        if (!ALLOWED_PRE_RAPTURE.includes(cast.ability.guid)) {
          return index;
        }
        return null;
      })
      .filter(Number) as number[];
  }

  get currentRamp() {
    return this.ramps[this.ramps.length - 1];
  }

  get guideCastBreakdown() {
    return this.ramps.map((ramp, ix) => {
      const [isExpanded, setIsExpanded] = useState(false);

      const header = (
        <>
          @ {this.owner.formatTimestamp(ramp.timestamp)}{' '}
          <SpellLink spell={TALENTS_PRIEST.RAPTURE_TALENT} />
        </>
      );

      const badCastTooltip = (index: number) => (
        <>
          Casting a spell like <SpellLink spell={abilityToSpell(ramp.rampHistory[index].ability)} />{' '}
          is not recommended while ramping. Make sure to mostly focus on applying{' '}
          <SpellLink spell={TALENTS_PRIEST.ATONEMENT_TALENT} /> when ramping.
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
              ramping. Highlight over the red boxes to see which spells these were.
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

      const usedSchism =
        ramp.damageRotation.filter((cast) => cast.ability.guid === TALENTS_PRIEST.SCHISM_TALENT.id)
          .length > 0;
      const earlySchism =
        usedSchism &&
        ramp.damageRotation.findIndex(
          (cast) => (cast.ability.guid = TALENTS_PRIEST.SCHISM_TALENT.id),
        ) < 3;
      const atonementTransferred = ramp.damageRotation.filter((cast) => {
        return ATONEMENT_DAMAGE_SOURCES[cast.ability.guid];
      }).length;

      const damageAnalysis = (
        <>
          Damage rotation breakdown:
          <div>
            Used <SpellLink spell={TALENTS_PRIEST.SCHISM_TALENT} />{' '}
            <PassFailCheckmark pass={usedSchism} />
          </div>
          <div>
            Used <SpellLink spell={TALENTS_PRIEST.SCHISM_TALENT} /> early{' '}
            <PassFailCheckmark pass={earlySchism} />
          </div>
          <div>
            Used {atonementTransferred} / {ramp.damageRotation.length} damage spells to transfer{' '}
            <SpellLink spell={TALENTS_PRIEST.ATONEMENT_TALENT} />: <br />
            <PassFailBar
              pass={atonementTransferred}
              total={ramp.damageRotation.length}
              passTooltip="The number of spells cast which transfer atonement."
              failTooltip="The number of spells cast which do not transfer atonement."
            />
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
          <div className="evang__container">
            <div className="evang__applicator-half">
              <div className="evang__cast-list">{spellSequence}</div>
              {ramp.badCastIndexes?.length && ramp.badCastIndexes?.length > 0
                ? problemOverview
                : noProblems}
            </div>
            <div>{damageAnalysis}</div>
          </div>
        </ControlledExpandable>
      );
    });
  }
}

export default RaptureAnalysis;
