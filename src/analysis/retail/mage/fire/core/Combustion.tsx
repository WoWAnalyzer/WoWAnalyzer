import { formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  BeginCastEvent,
  RemoveBuffEvent,
  GetRelatedEvent,
  HasRelatedEvent,
  FightEndEvent,
  EventType,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import AlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import SpellUsable from 'parser/shared/modules/SpellUsable';

export default class CombustionCasts extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    alwaysBeCasting: AlwaysBeCasting,
    spellUsable: SpellUsable,
  };
  protected abilityTracker!: AbilityTracker;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected spellUsable!: SpellUsable;

  hasFlameOn: boolean = this.selectedCombatant.hasTalent(TALENTS.FLAME_ON_TALENT);
  hasFlameAccelerant: boolean = this.selectedCombatant.hasTalent(TALENTS.FLAME_ACCELERANT_TALENT);

  combustCasts: CombustionCast[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.COMBUSTION_TALENT),
      this.onCombust,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.COMBUSTION_TALENT),
      this.onCombustEnd,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  onCombust(event: CastEvent) {
    if (this.selectedCombatant.getTalentRank(TALENTS.SPONTANEOUS_COMBUSTION_TALENT) === 2) {
      // If you have two points in Spontaneous Combustion, you gain 2 Charges.
      this.spellUsable.endCooldown(TALENTS.FIRE_BLAST_TALENT.id, event.timestamp, false);
      this.spellUsable.endCooldown(TALENTS.FIRE_BLAST_TALENT.id, event.timestamp, false);
    } else if (this.selectedCombatant.getTalentRank(TALENTS.SPONTANEOUS_COMBUSTION_TALENT) === 1) {
      // If you have one point in Spontaneous Combustion, you gain 1 charge.
      this.spellUsable.endCooldown(TALENTS.FIRE_BLAST_TALENT.id);
    }

    const precast: CastEvent | undefined = GetRelatedEvent(event, 'precast');
    const removeBuff: RemoveBuffEvent | undefined = GetRelatedEvent(event, EventType.RemoveBuff);

    let castDelay = 0;
    if (precast && HasRelatedEvent(precast, 'SpellCast')) {
      const beginCast: BeginCastEvent | undefined = GetRelatedEvent(precast, EventType.BeginCast);
      castDelay =
        beginCast && precast.timestamp > event.timestamp && beginCast.timestamp < event.timestamp
          ? precast.timestamp - event.timestamp
          : 0;
    }

    this.combustCasts.push({
      cast: event,
      remove: removeBuff?.timestamp || this.owner.fight.end_time,
      activeTime: 0,
      precast,
      castDelay,
      spellCasts: [],
    });
  }

  onCombustEnd(event: RemoveBuffEvent) {
    const cast: CastEvent | undefined = GetRelatedEvent(event, EventType.Cast);
    const index = this.combustCasts.findIndex((c) => c.cast.timestamp === cast?.timestamp);
    if (cast && index >= 0) {
      this.combustCasts[index].activeTime = this.alwaysBeCasting.getActiveTimeMillisecondsInWindow(
        cast?.timestamp,
        event.timestamp,
      );
    }
  }

  onFightEnd(event: FightEndEvent) {
    if (!this.selectedCombatant.hasBuff(TALENTS.COMBUSTION_TALENT.id, event.timestamp - 10)) {
      return;
    }
    const cast = this.combustCasts[this.combustCasts.length - 1].cast.timestamp;
    this.combustCasts[this.combustCasts.length - 1].activeTime =
      this.alwaysBeCasting.getActiveTimeMillisecondsInWindow(cast, event.timestamp);
  }

  onCast(event: CastEvent) {
    if (
      !this.selectedCombatant.hasBuff(TALENTS.COMBUSTION_TALENT.id) ||
      CASTS_THAT_ARENT_CASTS.includes(event.ability.guid)
    ) {
      return;
    }
    const index = this.combustCasts.findIndex(
      (c) => event.timestamp >= c.cast.timestamp && event.timestamp <= c.remove,
    );
    index >= 0 && this.combustCasts[index].spellCasts.push(event);
  }

  get totalPreCastDelay() {
    let delay = 0;
    this.combustCasts.forEach((c) => (delay += c.castDelay));
    return delay;
  }

  get totalCombustDuration() {
    let duration = 0;
    this.combustCasts.forEach((c) => (duration += c.remove - c.cast.timestamp));
    return duration;
  }

  get totalActiveTime() {
    let active = 0;
    this.combustCasts.forEach((c) => (active += c.activeTime));
    return active;
  }

  get averageCastDelay() {
    return this.totalPreCastDelay / this.combustCasts.length;
  }

  get overallActivePercent() {
    return this.totalActiveTime / this.totalCombustDuration;
  }

  get castBreakdown() {
    const castArray: number[][] = [];
    this.combustCasts &&
      this.combustCasts.forEach((c) => {
        const index = castArray.findIndex((arr) => arr.includes(c.cast.ability.guid));
        if (index !== -1) {
          castArray[index][1] += 1;
        } else {
          castArray.push([c.cast.ability.guid, 1]);
        }
      });
    return castArray;
  }

  get activeTimeThresholds() {
    return {
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get combustionCastDelayThresholds() {
    return {
      isGreaterThan: {
        minor: 700,
        average: 1000,
        major: 1500,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  statistic() {
    return (
      <Statistic
        wide
        size="flexible"
        position={STATISTIC_ORDER.CORE(30)}
        tooltip={
          <>
            When Combustion is active, you want to ensure you are only using damage spells that will
            allow you to get as many Pyroblast casts in as possible. Typically, you should be aiming
            to use up your charges of Phoenix Flames and Fire Blast first since they are both
            guaranteed to crit during Combustion. Then if you run out of charges and still have time
            left on Combustion, you can use Scorch to get an additional Pyroblast or two in before
            Combustion ends.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.COMBUSTION_TALENT}>
          <>
            <table className="table table-condensed">
              <tbody>
                <tr>
                  <td>
                    <small>Spells cast during Combust</small>
                  </td>
                  <td>
                    <small>Total Casts</small>
                  </td>
                  <td>
                    <small>% of Total Combust Casts</small>
                  </td>
                </tr>
                {this.castBreakdown
                  .sort((a, b) => b[1] - a[1])
                  .map((spell) => (
                    <tr key={Number(spell)} style={{ fontSize: 16 }}>
                      <td>
                        <SpellLink spell={Number(spell[0])} />
                      </td>
                      <td style={{ textAlign: 'center' }}>{spell[1]}</td>
                      <td style={{ textAlign: 'center' }}>
                        {formatPercentage(spell[1] / this.combustCasts.length || 0)}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export interface CombustionCast {
  cast: CastEvent;
  remove: number;
  activeTime: number;
  precast?: CastEvent;
  castDelay: number;
  spellCasts: CastEvent[];
}
