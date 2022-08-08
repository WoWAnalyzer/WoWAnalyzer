import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { SubSection } from 'interface/guide';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { mergeTimePeriods, OpenTimePeriod } from 'parser/core/mergeTimePeriods';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Combatants from 'parser/shared/modules/Combatants';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';

const LIFEBLOOM_HOTS: Spell[] = [SPELLS.LIFEBLOOM_HOT_HEAL, SPELLS.LIFEBLOOM_DTL_HOT_HEAL];
const LB_COLOR = '#00bb44';
const DTL_COLOR = '#dd5500';

class Lifebloom extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  /** true iff player has Dark Titan's Lesson legendary equipped */
  hasDTL = false;
  /** the number of lifeblooms the player currently has active */
  activeLifeblooms: number = 0;
  /** list of time periods when at least one lifebloom was active */
  lifebloomUptimes: OpenTimePeriod[] = [];
  /** list of time periods when at least two lifeblooms were active */
  dtlUptimes: OpenTimePeriod[] = [];

  constructor(options: Options) {
    super(options);
    this.hasDTL = this.selectedCombatant.hasLegendary(SPELLS.THE_DARK_TITANS_LESSON);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(LIFEBLOOM_HOTS),
      this.onApplyLifebloom,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(LIFEBLOOM_HOTS),
      this.onRemoveLifebloom,
    );
  }

  onApplyLifebloom(event: ApplyBuffEvent) {
    if (this.activeLifeblooms === 0) {
      // LBS 0 -> 1
      this.lifebloomUptimes.push({ start: event.timestamp });
    } else if (this.activeLifeblooms === 1) {
      // LBS 1 -> 2
      this.dtlUptimes.push({ start: event.timestamp });
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
      if (this.dtlUptimes.length > 0) {
        this.dtlUptimes[this.dtlUptimes.length - 1].end = event.timestamp;
      }
    }
    this.activeLifeblooms -= 1;
  }

  /** The time at least one lifebloom was active */
  get oneLifebloomUptime() {
    return this._getTotalUptime(this.lifebloomUptimes);
  }

  /** The percent of the encounter at least one lifebloom was active */
  get oneLifebloomUptimePercent() {
    return this.oneLifebloomUptime / this.owner.fightDuration;
  }

  /** The time at two lifeblooms were active */
  get twoLifebloomUptime() {
    return this._getTotalUptime(this.dtlUptimes);
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
        SPELLS.LIFEBLOOM_DTL_HOT_HEAL.id,
        this.selectedCombatant.id,
      )
    );
  }

  /** The time a lifebloom was active on someone other than the selected player */
  get othersLifebloomUptime(): number {
    const summedTotalLifebloomUptime = Object.values(this.combatants.players).reduce(
      (uptime, player) =>
        uptime +
        player.getBuffUptime(SPELLS.LIFEBLOOM_HOT_HEAL.id) +
        player.getBuffUptime(SPELLS.LIFEBLOOM_DTL_HOT_HEAL.id),
      0,
    );
    return summedTotalLifebloomUptime - this.selfLifebloomUptime;
  }

  // TODO suggestion for two lifebloom uptime with DTL

  /** Guide subsection describing the proper usage of Lifebloom */
  get guideSubsection(): JSX.Element {
    return (
      <SubSection>
        <p>
          <b>
            <SpellLink id={SPELLS.LIFEBLOOM_HOT_HEAL.id} />
          </b>{' '}
          can only be active on one target at time and provides similar throughput to Rejuvenation.
          However, it causes <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} /> procs and so is a big
          benefit to your mana efficiency . It should always be active on a target - the tank is
          usually a safe bet.
        </p>
        {this.selectedCombatant.hasTalent(SPELLS.PHOTOSYNTHESIS_TALENT) && (
          <p>
            Because you took{' '}
            <strong>
              <SpellLink id={SPELLS.PHOTOSYNTHESIS_TALENT.id} />
            </strong>
            , high uptime is particularly important. Typically the Lifebloom-on-self effect is most
            powerful.
            <br />
            Total Uptime on{' '}
            <strong>
              Self: {formatPercentage(this.selfLifebloomUptime / this.owner.fightDuration, 1)}%
            </strong>{' '}
            / on{' '}
            <strong>
              Others: {formatPercentage(this.othersLifebloomUptime / this.owner.fightDuration, 1)}%
            </strong>
          </p>
        )}
        {this.subStatistic()}
      </SubSection>
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.oneLifebloomUptimePercent,
      isLessThan: {
        minor: 0.8,
        average: 0.6,
        major: 0.4,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.LIFEBLOOM_HOT_HEAL.id} /> uptime can be improved.{' '}
          {this.hasDTL ? (
            <>
              High uptime is particularly important for taking advantage of your equipped{' '}
              <SpellLink id={SPELLS.THE_DARK_TITANS_LESSON.id} />
            </>
          ) : (
            ''
          )}
        </>,
      )
        .icon(SPELLS.LIFEBLOOM_HOT_HEAL.icon)
        .actual(
          t({
            id: 'druid.restoration.suggestions.lifebloom.uptime',
            message: `${formatPercentage(this.oneLifebloomUptimePercent)}% uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  subStatistic() {
    const subBars = [];
    if (this.hasDTL) {
      subBars.push({
        spells: [SPELLS.THE_DARK_TITANS_LESSON],
        uptimes: mergeTimePeriods(this.dtlUptimes, this.owner.currentTimestamp),
        color: DTL_COLOR,
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
