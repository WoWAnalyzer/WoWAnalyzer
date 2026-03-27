import type { JSX } from 'react';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { SubSection } from 'interface/guide';
import Events, { HealEvent } from 'parser/core/Events';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import CooldownGrid from 'interface/CooldownGrid/CooldownGrid';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';
import Explanation from 'interface/guide/components/Explanation';
import { EventType } from 'parser/core/Events';

import CooldownThroughputTracker from '../features/CooldownThroughputTracker';

class Ascendance extends Analyzer {
  static dependencies = {
    cooldownThroughputTracker: CooldownThroughputTracker,
  };
  healing = 0;
  eventCount = 0;

  protected cooldownThroughputTracker!: CooldownThroughputTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ASCENDANCE_RESTORATION_TALENT);

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ASCENDANCE_HEAL, SPELLS.ASCENDANCE_INITIAL_HEAL]),
      this._onHeal,
    );
  }

  _onHeal(event: HealEvent) {
    this.healing += event.amount + (event.absorbed || 0);
  }

  get guideSubsection(): JSX.Element {
    const tracker = this.cooldownThroughputTracker;

    const validCastIds = [TALENTS.CHAIN_HEAL_TALENT.id, SPELLS.HEALING_WAVE.id];

    if (this.selectedCombatant.hasTalent(TALENTS.SURGING_TOTEM_TALENT)) {
      validCastIds.push(SPELLS.HEALING_STREAM_TOTEM.id);
      validCastIds.push(SPELLS.STORMSTREAM_TOTEM.id);
    }

    const swiftnessCastIds = [
      SPELLS.ANCESTRAL_SWIFTNESS_CAST.id,
      TALENTS.NATURES_SWIFTNESS_TALENT.id,
    ];

    const items = tracker.pastCooldowns
      .filter((cd) => cd.spell === TALENTS.ASCENDANCE_RESTORATION_TALENT.id)
      .map((cd) => {
        const castEvents = cd.events.filter((e) => e.type === EventType.Cast);
        const validCasts = cd.events.filter(
          (e) => e.type === EventType.Cast && validCastIds.includes(e.ability.guid),
        );
        const swiftnessCasts = cd.events.filter(
          (e) => e.type === EventType.Cast && swiftnessCastIds.includes(e.ability.guid),
        );
        const castRatioPercentage =
          castEvents.length > 0
            ? Math.round(((validCasts.length + swiftnessCasts.length) / castEvents.length) * 100)
            : 0;
        const perf =
          castRatioPercentage > 75
            ? QualitativePerformance.Good
            : castRatioPercentage > 50
              ? QualitativePerformance.Ok
              : QualitativePerformance.Fail;
        console.log(castEvents);
        console.log(validCasts);

        return {
          perf,
          checklistItems: [
            {
              label: (
                <>
                  <SpellLink spell={TALENTS.CHAIN_HEAL_TALENT} /> or{' '}
                  <SpellLink spell={SPELLS.HEALING_WAVE} /> casts
                </>
              ),
              result: (
                <>
                  {validCasts.length} ({castRatioPercentage}%)
                </>
              ),
            },
            {
              label: (
                <>
                  <SpellLink
                    spell={
                      this.selectedCombatant.hasTalent(TALENTS.SURGING_TOTEM_TALENT)
                        ? TALENTS.NATURES_SWIFTNESS_TALENT
                        : TALENTS.ANCESTRAL_SWIFTNESS_TALENT
                    }
                  />{' '}
                  used.
                </>
              ),
              result: (
                <>
                  {swiftnessCasts.length > 0 ? (
                    <PerformanceMark perf={QualitativePerformance.Good} />
                  ) : (
                    <PerformanceMark perf={QualitativePerformance.Fail} />
                  )}
                </>
              ),
            },
          ],
          range: { start: cd.start, end: cd.end! },
        };
      });

    const cooldowns = [];
    if (this.selectedCombatant.hasTalent(TALENTS.SURGING_TOTEM_TALENT)) {
      cooldowns.push(TALENTS.NATURES_SWIFTNESS_TALENT);
    } else {
      cooldowns.push(SPELLS.ANCESTRAL_SWIFTNESS_CAST);
    }
    cooldowns.push(TALENTS.UNLEASH_LIFE_TALENT);
    return (
      <SubSection title={<SpellLink spell={TALENTS.ASCENDANCE_RESTORATION_TALENT} />}>
        <Explanation>
          <p>
            <SpellLink spell={TALENTS.ASCENDANCE_RESTORATION_TALENT} /> is your major and most
            important healing cooldown. A big percentage of your overall healing during a fight will
            come from your casts while <SpellLink spell={TALENTS.ASCENDANCE_RESTORATION_TALENT} />{' '}
            is active, so you don't want to waste this time using low-value spells.{' '}
            <b>
              Almost all of your casts during{' '}
              <SpellLink spell={TALENTS.ASCENDANCE_RESTORATION_TALENT} /> should be either{' '}
              <SpellLink spell={TALENTS.CHAIN_HEAL_TALENT} /> or{' '}
              <SpellLink spell={SPELLS.HEALING_WAVE} />
            </b>
          </p>
          <p>
            The best way to use <SpellLink spell={TALENTS.ASCENDANCE_RESTORATION_TALENT} /> is to
            cast <SpellLink spell={TALENTS.RIPTIDE_TALENT} /> and{' '}
            <SpellLink spell={TALENTS.UNLEASH_LIFE_TALENT} /> beforehand to have all your buffs
            ready going into it, and then using{' '}
            <SpellLink
              spell={
                this.selectedCombatant.hasTalent(TALENTS.SURGING_TOTEM_TALENT)
                  ? TALENTS.NATURES_SWIFTNESS_TALENT
                  : TALENTS.ANCESTRAL_SWIFTNESS_TALENT
              }
            />{' '}
            during it.
          </p>
          {this.selectedCombatant.hasTalent(TALENTS.SURGING_TOTEM_TALENT) ? (
            <p>
              For Totemic, <SpellLink spell={TALENTS.HEALING_STREAM_TOTEM_RESTORATION_TALENT} /> is
              also a good cast, as it will automatically cast a{' '}
              <SpellLink spell={TALENTS.CHAIN_HEAL_TALENT} /> as well.
            </p>
          ) : (
            <></>
          )}
        </Explanation>
        <CooldownGrid
          label={<SpellLink spell={TALENTS.ASCENDANCE_RESTORATION_TALENT} />}
          timeline={{
            cooldowns: cooldowns,
          }}
          table={{
            type: EventType.Heal,
          }}
          items={items}
        />
      </SubSection>
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS.ASCENDANCE_RESTORATION_TALENT} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
      />
    );
  }
}

export default Ascendance;
