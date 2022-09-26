import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { SubSection } from 'interface/guide';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { mergeTimePeriods, OpenTimePeriod } from 'parser/core/mergeTimePeriods';
import Combatants from 'parser/shared/modules/Combatants';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';
import { TALENTS_DRUID } from 'common/TALENTS';
import { LIFEBLOOM_BUFFS } from 'analysis/retail/druid/restoration/constants';

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

  constructor(options: Options) {
    super(options);
    this.hasUndergrowth = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.UNDERGROWTH_RESTORATION_TALENT,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(LIFEBLOOM_BUFFS),
      this.onApplyLifebloom,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(LIFEBLOOM_BUFFS),
      this.onRemoveLifebloom,
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
        {this.selectedCombatant.hasTalent(TALENTS_DRUID.PHOTOSYNTHESIS_RESTORATION_TALENT) && (
          <p>
            Because you took{' '}
            <strong>
              <SpellLink id={TALENTS_DRUID.PHOTOSYNTHESIS_RESTORATION_TALENT.id} />
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

  subStatistic() {
    const subBars = [];
    if (this.hasUndergrowth) {
      subBars.push({
        spells: [TALENTS_DRUID.UNDERGROWTH_RESTORATION_TALENT],
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
