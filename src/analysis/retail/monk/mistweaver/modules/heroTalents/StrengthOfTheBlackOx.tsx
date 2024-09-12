import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { isStrengthOfTheBlackOxConsumed } from '../../normalizers/CastLinkNormalizer';
import SpellLink from 'interface/SpellLink';
import { SPELL_COLORS } from '../../constants';
import Abilities from '../features/Abilities';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { Uptime } from 'parser/ui/UptimeBar';

type UptimeWithType = {
  uptime: Uptime;
  expired: boolean | undefined;
};

// TODO: add checklist for mana tea usage
class StrengthOfTheBlackOx extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  protected abilities!: Abilities;
  wastedBuffs: number = 0;
  uptimes: UptimeWithType[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.STRENGTH_OF_THE_BLACK_OX_TALENT);

    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.STRENGTH_OF_THE_BLACK_OX_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.STRENGTH_OF_THE_BLACK_OX_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.STRENGTH_OF_THE_BLACK_OX_BUFF),
      this.onRemoveBuff,
    );
  }

  private startUptimeWindow(timestamp: number) {
    this.uptimes.push({
      uptime: {
        start: timestamp,
        end: -1,
      },
      expired: undefined,
    });
  }

  private endUptimeWindow(timestamp: number, expired: boolean) {
    if (this.uptimes.length) {
      const cur = this.uptimes.at(-1)!;
      cur.uptime.end = timestamp;
      cur.expired = expired;
    }
  }

  private onApplyBuff(event: ApplyBuffEvent) {
    this.startUptimeWindow(event.timestamp);
  }

  private onRefreshBuff(event: RefreshBuffEvent) {
    this.wastedBuffs += 1;
    this.endUptimeWindow(event.timestamp, true);
    this.startUptimeWindow(event.timestamp);
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    const isConsumed = isStrengthOfTheBlackOxConsumed(event);
    if (!isConsumed) {
      this.wastedBuffs += 1;
    }
    this.endUptimeWindow(event.timestamp, !isConsumed);
  }

  get nestedUptimes(): Uptime[] {
    const result: Uptime[] = [];
    const toInvert: Uptime[] = [];
    this.uptimes.forEach((u) => {
      if (u.expired) {
        toInvert.push(u.uptime);
      }
    });
    // no expirations, mark entire bar as good utilization
    if (!toInvert.length) {
      return [{ start: this.owner.fight.start_time, end: this.owner.fight.end_time }];
    }
    // get inverse of expiration periods
    let cur = 0;
    let prev = -1;
    for (; cur < toInvert.length; cur += 1) {
      if (prev >= 0) {
        result.push({
          start: toInvert[prev].end,
          end: toInvert[cur].start,
        });
      } else {
        // start of fight
        result.push({
          start: this.owner.fight.start_time,
          end: toInvert[cur].start,
        });
      }
      prev = cur;
    }
    return result;
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_MONK.STRENGTH_OF_THE_BLACK_OX_TALENT} />
        </b>{' '}
        is a buff that makes your next <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} />{' '}
        have a reduced cast time and apply a shield to 5 nearby allies. It is very important to
        never let this buff refresh as it is a considerable amount of shielding.
      </p>
    );
    const styleObj = {
      fontSize: 20,
    };
    const styleObjInner = {
      fontSize: 15,
    };
    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_MONK.STRENGTH_OF_THE_BLACK_OX_TALENT} /> utilization
          </strong>
          <small>
            Grey periods indicate periods where your{' '}
            <SpellLink spell={SPELLS.STRENGTH_OF_THE_BLACK_OX_BUFF} /> buff expired and pink
            indicates periods where you did not let the buff expire.
          </small>

          {uptimeBarSubStatistic(
            this.owner.fight,
            {
              spells: [SPELLS.STRENGTH_OF_THE_BLACK_OX_BUFF],
              uptimes: this.nestedUptimes,
              color: SPELL_COLORS.TIGER_PALM,
            },
            undefined,
            undefined,
            undefined,
            'utilization',
          )}
          <div style={styleObj}>
            <b>{this.wastedBuffs}</b> <small style={styleObjInner}>wasted buffs</small>
          </div>
        </RoundedPanel>
      </div>
    );
    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

export default StrengthOfTheBlackOx;
