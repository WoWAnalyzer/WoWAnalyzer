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
import { PassFailCheckmark } from 'interface/guide';
import { ATONEMENT_DAMAGE_SOURCES, TE_GUIDE_FILTER, TE_SPELLS } from '../../constants';
import PassFailBar from 'interface/guide/components/PassFailBar';
import { isHolySpell, isShadowSpell } from '../spells/Helper';

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
  damageRotation: CastEvent[];
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

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.fillDpsRotation);
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

    this.ramps.push({ timestamp: event.timestamp, rampHistory: rampHistory, damageRotation: [] });

    this.cutSequence(rampHistory);
  }

  // gets your spells cast 10s after pressing evangelism.
  fillDpsRotation(event: CastEvent) {
    if (this.ramps.length < 1) {
      return;
    }
    if (event.timestamp < this.ramps[this.ramps.length - 1].timestamp + 10000) {
      this.ramps[this.ramps.length - 1].damageRotation.push(event);
    }
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

      const applicatorSequence = ramp.rampHistory.map((cast, index) => {
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

      const checkHarsh = (damageSequence: CastEvent[]) => {
        let harshPenances = 0;
        const hasHarshDiscipline = (cast: CastEvent) => {
          this.selectedCombatant.hasBuff(SPELLS.HARSH_DISCIPLINE_BUFF.id, cast.timestamp)
            ? (harshPenances += 1)
            : null;
        };
        damageSequence.forEach((cast) => {
          cast.ability.guid === SPELLS.PENANCE_CAST.id ? hasHarshDiscipline(cast) : null;
        });
        return harshPenances > 0;
      };

      const damageAnalysis = (
        <>
          Damage rotation breakdown:
          <div className="">
            <PassFailCheckmark pass={usedSchism} />
            <span className="evangelism__damage-analysis">
              Used <SpellLink id={TALENTS_PRIEST.SCHISM_TALENT.id} />
            </span>{' '}
          </div>
          <div>
            <PassFailCheckmark pass={earlySchism} />
            <span className="evangelism__damage-analysis">
              Used <SpellLink id={TALENTS_PRIEST.SCHISM_TALENT.id} /> early
            </span>{' '}
          </div>
          <div>
            Used {atonementTransferred} / {ramp.damageRotation.length} damage spells to transfer{' '}
            <SpellLink id={TALENTS_PRIEST.ATONEMENT_TALENT.id} />: <br />
            <PassFailBar
              pass={atonementTransferred}
              total={ramp.damageRotation.length}
              passTooltip="The number of spells cast which transfer atonement."
              failTooltip="The number of spells cast which do not transfer atonement."
            />
            <div>
              <PassFailCheckmark pass={checkHarsh(ramp.damageRotation)} />
              <span className="evangelism__damage-analysis">
                One or more <SpellLink id={SPELLS.PENANCE_CAST.id} /> empowered by{' '}
                <SpellLink id={TALENTS_PRIEST.HARSH_DISCIPLINE_TALENT.id} />
              </span>
            </div>
          </div>
        </>
      );

      const badDamageCastTooltip = (index: number) => (
        <>
          Once you have applied <SpellLink id={TALENTS_PRIEST.ATONEMENT_TALENT.id} />
          s, it is important to get good value out of them by using many high damage spells. Casting
          non damage spells should be avoided where possible.
        </>
      );

      const badTeTooltip = () => (
        <>
          Cast not buffed by opposite spell school. Make sure to plan your damage rotation with{' '}
          <SpellLink id={TALENTS_PRIEST.TWILIGHT_EQUILIBRIUM_TALENT.id} />
        </>
      );

      const goodTeCast = (index: number) => {
        // first cast cannot be buffed by TE - The buff is too short.
        if (index === 0) {
          return true;
        }

        if (TE_GUIDE_FILTER.includes(ramp.damageRotation[index].ability.guid)) {
          //first cast is holy
          if (isHolySpell(ramp.damageRotation[index].ability.guid)) {
            // second cast also holy
            if (isHolySpell(ramp.damageRotation[index - 1].ability.guid)) {
              return false;
            }
          }

          // first cast is shadow
          if (isShadowSpell(ramp.damageRotation[index].ability.guid)) {
            // second cast also Shadow
            if (isShadowSpell(ramp.damageRotation[index - 1].ability.guid)) {
              return false;
            }
          }
        }

        return true;
      };

      const teTooltip = (index: number) => {
        const spell = ramp.damageRotation[index].ability.guid;
        return TE_SPELLS().includes(spell) && goodTeCast(index) ? '' : badTeTooltip();
      };

      const damageSequence = ramp.damageRotation.map((cast, index) => {
        const tooltipContent = () => {
          const badCast = ATONEMENT_DAMAGE_SOURCES[cast.ability.guid]
            ? null
            : badDamageCastTooltip(index);
          const badTe = TE_SPELLS().includes(cast.ability.guid) ? teTooltip(index) : null;

          if (!badCast && !badTe) {
            return <>No issues found.</>;
          } else {
            return (
              <>
                {badCast}
                {badTe}
              </>
            );
          }
        };

        const iconClass = `evang__icon ${
          ATONEMENT_DAMAGE_SOURCES[cast.ability.guid] ? '' : '--fail'
        } ${TE_SPELLS().includes(cast.ability.guid) && goodTeCast(index) ? '' : '--warning'}`;

        return (
          <Tooltip content={tooltipContent()} key={index} direction="up">
            <div className="" data-place="top">
              <Icon icon={cast.ability.abilityIcon} className={iconClass} />
            </div>
          </Tooltip>
        );
      });

      return (
        <ControlledExpandable
          header={header}
          element="section"
          expanded={!isExpanded}
          inverseExpanded={() => setIsExpanded(!isExpanded)}
          key={ix}
        >
          <div className="evang__container">
            <div className="evang__left-section">
              <div className="evang__applicator-half">
                <h3>Applicators</h3>
                <div className="evang__cast-list">{applicatorSequence}</div>
              </div>
              <div className="damage-container">
                <h3>Damage Rotation</h3>
                <div className="evang__cast-list">{damageSequence}</div>
              </div>
            </div>
            <div>{damageAnalysis}</div>
          </div>
        </ControlledExpandable>
      );
    });
  }
}

export default EvangelismAnalysis;
