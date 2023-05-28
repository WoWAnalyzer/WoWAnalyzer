import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { mergeTimePeriods, OpenTimePeriod } from 'parser/core/mergeTimePeriods';
import Combatants from 'parser/shared/modules/Combatants';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';
import { TALENTS_DRUID } from 'common/TALENTS';
import { LIFEBLOOM_BUFFS } from 'analysis/retail/druid/restoration/constants';
import { causedBloom } from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';

const LB_COLOR = '#00bb44';
const UNDERGROWTH_COLOR = '#dd5500';

/**
 * Components related to Lifebloom and Lifebloom's uptime.
 * Includes uptime tracking for Undergrowth talent (allows 2 LB up at once)
 */
class Lifebloom extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  /** true iff player has the Undergrowth talent */
  hasUndergrowth = false;
  /** the number of lifeblooms the player currently has active */
  activeLifeblooms: number = 0;
  /** list of time periods when at least one lifebloom was active */
  lifebloomUptimes: OpenTimePeriod[] = [];
  /** list of time periods when at least two lifeblooms were active */
  undergrowthUptimes: OpenTimePeriod[] = [];

  possibleNaturalBlooms: number = 0;
  actualNaturalBlooms: number = 0;

  constructor(options: Options) {
    super(options);
    this.hasUndergrowth = this.selectedCombatant.hasTalent(TALENTS_DRUID.UNDERGROWTH_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(LIFEBLOOM_BUFFS),
      this.onApplyLifebloom,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(LIFEBLOOM_BUFFS),
      this.onRemoveLifebloom,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(LIFEBLOOM_BUFFS),
      this.onPossibleBloomTrigger,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(LIFEBLOOM_BUFFS),
      this.onPossibleBloomTrigger,
    );
  }

  onApplyLifebloom(event: ApplyBuffEvent) {
    if (this.activeLifeblooms === 0) {
      // LBS 0 -> 1
      this.lifebloomUptimes.push({ start: event.timestamp });
    } else if (this.activeLifeblooms === 1) {
      // LBS 1 -> 2
      this.undergrowthUptimes.push({ start: event.timestamp });
    }
    this.activeLifeblooms += 1;
  }

  onRemoveLifebloom(event: RemoveBuffEvent) {
    if (this.activeLifeblooms === 1) {
      // LBS 1 -> 0
      if (this.lifebloomUptimes.length > 0) {
        this.lifebloomUptimes[this.lifebloomUptimes.length - 1].end = event.timestamp;
      }
    } else if (this.activeLifeblooms === 2) {
      // LBS 2 -> 1
      if (this.undergrowthUptimes.length > 0) {
        this.undergrowthUptimes[this.undergrowthUptimes.length - 1].end = event.timestamp;
      }
    }
    this.activeLifeblooms -= 1;
  }

  onPossibleBloomTrigger(event: RemoveBuffEvent | RefreshBuffEvent) {
    this.possibleNaturalBlooms += 1;
    if (causedBloom(event)) {
      this.actualNaturalBlooms += 1;
    }
  }

  /** The time at least one lifebloom was active */
  get oneLifebloomUptime() {
    return this._getTotalUptime(this.lifebloomUptimes);
  }

  /** The time at two lifeblooms were active */
  get twoLifebloomUptime() {
    return this._getTotalUptime(this.undergrowthUptimes);
  }

  _getTotalUptime(uptimes: OpenTimePeriod[]) {
    return uptimes.reduce(
      (acc, ut) => acc + (ut.end === undefined ? this.owner.currentTimestamp : ut.end) - ut.start,
      0,
    );
  }

  /** The time a lifebloom was active on the selected player */
  get selfLifebloomUptime(): number {
    return (
      this.selectedCombatant.getBuffUptime(
        SPELLS.LIFEBLOOM_HOT_HEAL.id,
        this.selectedCombatant.id,
      ) +
      this.selectedCombatant.getBuffUptime(
        SPELLS.LIFEBLOOM_UNDERGROWTH_HOT_HEAL.id,
        this.selectedCombatant.id,
      )
    );
  }

  /** The time a lifebloom was active on someone other than the selected player */
  get othersLifebloomUptime(): number {
    const summedTotalLifebloomUptime = Object.values(this.combatants.players).reduce(
      (uptime, player) =>
        uptime +
        player.getBuffUptime(SPELLS.LIFEBLOOM_HOT_HEAL.id, this.selectedCombatant.id) +
        player.getBuffUptime(SPELLS.LIFEBLOOM_UNDERGROWTH_HOT_HEAL.id, this.selectedCombatant.id),
      0,
    );
    return summedTotalLifebloomUptime - this.selfLifebloomUptime;
  }

  /** Guide subsection describing the proper usage of Lifebloom */
  get guideSubsection(): JSX.Element {
    const hasPhoto = this.selectedCombatant.hasTalent(TALENTS_DRUID.PHOTOSYNTHESIS_TALENT);
    const hasUndergrowth = this.selectedCombatant.hasTalent(TALENTS_DRUID.UNDERGROWTH_TALENT);
    const hasVerdancy = this.selectedCombatant.hasTalent(TALENTS_DRUID.VERDANCY_TALENT);
    const selfUptimePercent = this.selfLifebloomUptime / this.owner.fightDuration;
    const othersUptimePercent = this.othersLifebloomUptime / this.owner.fightDuration;

    const explanation = (
      <>
        <p>
          <b>
            <SpellLink id={SPELLS.LIFEBLOOM_HOT_HEAL.id} />
          </b>{' '}
          can only be active on {hasUndergrowth ? 'two targets' : 'one target'} at a time{' '}
          {hasUndergrowth && (
            <>
              (due to <SpellLink id={TALENTS_DRUID.UNDERGROWTH_TALENT.id} />)
            </>
          )}{' '}
          and provides similar throughput to Rejuvenation. However, it causes{' '}
          <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} /> procs and so is a big benefit to your mana
          efficiency. It should always be active on a target - the tank is usually a safe bet.
        </p>
        {hasVerdancy && (
          <p>
            Because you took{' '}
            <strong>
              <SpellLink id={TALENTS_DRUID.VERDANCY_TALENT.id} />
            </strong>
            , you should take extra care to allow your Lifeblooms to bloom. Refreshing lifebloom
            early or swapping targets before the existing Lifebloom has completed both will cause
            the bloom to be skipped - avoid doing this.
            <br />
            <strong>
              Lifebloom casts that bloomed:{' '}
              {formatPercentage(this.actualNaturalBlooms / this.possibleNaturalBlooms, 1)}%
            </strong>
          </p>
        )}
        {hasPhoto && (
          <p>
            Because you took{' '}
            <strong>
              <SpellLink id={TALENTS_DRUID.PHOTOSYNTHESIS_TALENT.id} />
            </strong>
            , high uptime is particularly important. Typically the Lifebloom-on-self effect is most
            powerful{' '}
            {hasVerdancy && (
              <>
                but because you took <SpellLink id={TALENTS_DRUID.VERDANCY_TALENT.id} />, the extra
                blooms from the 'on-others' effect will also be very powerful
              </>
            )}
            .
            {hasUndergrowth && (
              <>
                {' '}
                Remember that <SpellLink id={TALENTS_DRUID.UNDERGROWTH_TALENT.id} /> allows two
                lifeblooms, and both will benefit!
              </>
            )}
            <br />
            Total Uptime on <strong>Self: {formatPercentage(selfUptimePercent, 1)}%</strong> / on{' '}
            <strong>Others: {formatPercentage(othersUptimePercent, 1)}%</strong>
            {selfUptimePercent + othersUptimePercent > 1 && (
              <>
                {' '}
                <small>
                  (value can sum to greater than 100% due to multiple lifeblooms being active)
                </small>
              </>
            )}
          </p>
        )}
      </>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>Lifebloom uptimes</strong>
          {this.subStatistic()}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    const subBars = [];
    if (this.hasUndergrowth) {
      subBars.push({
        spells: [TALENTS_DRUID.UNDERGROWTH_TALENT],
        uptimes: mergeTimePeriods(this.undergrowthUptimes, this.owner.currentTimestamp),
        color: UNDERGROWTH_COLOR,
      });
    }

    return uptimeBarSubStatistic(
      this.owner.fight,
      {
        spells: [SPELLS.LIFEBLOOM_HOT_HEAL],
        uptimes: mergeTimePeriods(this.lifebloomUptimes, this.owner.currentTimestamp),
        color: LB_COLOR,
      },
      subBars,
      SubPercentageStyle.ABSOLUTE,
    );
  }
}

export default Lifebloom;
