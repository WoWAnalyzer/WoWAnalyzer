import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { CastPerformanceBox, CastPerformanceEntry } from '../elements/CastPerformanceBox';
import { GUIDE_EXPLANATION_PERCENT_WIDTH } from 'analysis/retail/shaman/shared/constants';

const SURGE_OF_POWER = {
  AFFECTED_CASTS: [
    SPELLS.FLAME_SHOCK,
    TALENTS.FROST_SHOCK_TALENT,
    TALENTS.LAVA_BURST_TALENT,
    SPELLS.LIGHTNING_BOLT,
    TALENTS.CHAIN_LIGHTNING_TALENT,
  ],
};

const buffRemovalGracePeriodMs = 100;

class SurgeOfPower extends Analyzer {
  sopBuffedAbilities: { [key: number]: number } = {};
  // total SK + SoP lightning bolt casts
  skSopCasts = 0;
  // total SK lightning bolt casts
  skCasts = 0;

  sopBuffs = 0;

  castEntries: CastPerformanceEntry[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SURGE_OF_POWER_TALENT);
    if (!this.active) {
      return;
    }

    Object.values(SURGE_OF_POWER.AFFECTED_CASTS).forEach(({ id: spellid }) => {
      this.sopBuffedAbilities[spellid] = 0;
    });

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SURGE_OF_POWER.AFFECTED_CASTS),
      this._onCast,
    );
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_POWER_BUFF),
      () => {
        this.sopBuffs += 1;
      },
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.skSopCasts / this.skCasts,
      isLessThan: {
        minor: 0.9,
        average: 0.75,
        major: 0.5,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  _onCast(event: CastEvent) {
    // This module isn't picking up every cast.  It's possible the debuff is
    // getting removed before the cast goes out.

    // cast lightning bolt with only SK buff active
    if (
      this.selectedCombatant.hasBuff(
        TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT.id,
        event.timestamp,
        buffRemovalGracePeriodMs,
      ) &&
      event.ability.guid === SPELLS.LIGHTNING_BOLT.id
    ) {
      this.skCasts += 1;
    }

    if (
      !this.selectedCombatant.hasBuff(
        SPELLS.SURGE_OF_POWER_BUFF.id,
        event.timestamp,
        buffRemovalGracePeriodMs,
      )
    ) {
      return;
    }

    event.meta = event.meta || {};
    event.meta.isEnhancedCast = true;
    this.sopBuffedAbilities[event.ability.guid] += 1;

    // cast lightning bolt with SoP and SK buffs active
    if (
      this.selectedCombatant.hasBuff(
        TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT.id,
        event.timestamp,
        buffRemovalGracePeriodMs,
      ) &&
      event.ability.guid === SPELLS.LIGHTNING_BOLT.id
    ) {
      this.skSopCasts += 1;
    }

    this.addCastEntry(event);
  }

  addCastEntry(event: CastEvent) {
    const id = event.ability.guid;
    if (
      [
        // Only if 1-2 targets
        SPELLS.LIGHTNING_BOLT.id,
        // TODO: only if 6 targets
        TALENTS.CHAIN_LIGHTNING_TALENT.id,
      ].includes(id)
    ) {
      if (
        this.selectedCombatant.hasBuff(
          TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT.id,
          event.timestamp,
          buffRemovalGracePeriodMs,
        )
      ) {
        this.castEntries.push({
          value: QualitativePerformance.Perfect,
          description: (
            <>
              <SpellLink id={id} /> with{' '}
              <SpellLink id={TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT.id} />
            </>
          ),
          timestamp: event.timestamp,
        });
      } else {
        this.castEntries.push({
          value: QualitativePerformance.Good,
          description: <SpellLink id={id} />,
          timestamp: event.timestamp,
        });
      }
    } else {
      this.castEntries.push({
        value: QualitativePerformance.Fail,
        description: <SpellLink id={id} />,
        timestamp: event.timestamp,
      });
    }
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL()} size="flexible">
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Ability</th>
              <th>Number of Buffed Casts</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(this.sopBuffedAbilities).map((e) => (
              <tr key={e}>
                <th>
                  <SpellLink id={Number(e)} />
                </th>
                <td>{this.sopBuffedAbilities[Number(e)]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Statistic>
    );
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          You should aim to empower all of your Stormkeeper lightning bolts with Surge of Power. You
          can accomplish this consistently by pooling to 95+ maelstrom right before Stormkeeper is
          available, then casting ES {'->'} SK {'->'} LB {'->'} LvB {'->'} ES {'->'} LB.
        </span>,
      )
        .icon(TALENTS.SURGE_OF_POWER_TALENT.icon)
        .actual(
          t({
            id: 'shaman.elemental.suggestions.surgeOfPower.stormKeeperEmpowered',
            message: `${formatPercentage(
              actual,
            )}% of Stormkeeper Lightning Bolts empowered with Surge`,
          }),
        )
        .recommended(`100% is recommended.`),
    );
  }

  guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <b>
            <SpellLink id={TALENTS.SURGE_OF_POWER_TALENT.id} />
          </b>{' '}
          provides the most value to <SpellLink id={SPELLS.LIGHTNING_BOLT} /> for 1-2 targets and{' '}
          <SpellLink id={TALENTS.CHAIN_LIGHTNING_TALENT} /> at 6 targets or more. The gains for
          optimizing at 3-5 targets are generally too small to be worth the overhead.
        </p>
      </>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink id={TALENTS.SURGE_OF_POWER_TALENT.id} /> usage
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            <CastPerformanceBox
              entries={this.castEntries}
              startTime={this.owner.fight.start_time}
            />
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_EXPLANATION_PERCENT_WIDTH);
  }
}

export default SurgeOfPower;
