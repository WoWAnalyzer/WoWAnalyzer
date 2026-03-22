import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { EventType } from 'parser/core/Events';
import Analyzer from 'parser/core/Analyzer';
import GuideSection from 'interface/guide/components/GuideSection';
import CastSummary, { type CastEvaluation } from 'interface/guide/components/CastSummary';
import CastSequence, {
  SpellSequence,
  type CastSequenceEntry,
  type CastInSequence,
} from 'interface/guide/components/CastSequence';
import EventHistory from 'parser/shared/modules/EventHistory';

import ArcaneSurge, { ArcaneSurgeData } from '../analyzers/ArcaneSurge';
import { TipBox } from 'interface/guide/components';
import { SpellSeq } from 'parser/ui/SpellSeq';
import { formatPercentage } from 'common/format';

const SURGE_PRE_WINDOW = 10000;
const SURGE_POST_WINDOW = 5000; // 7.5 seconds before and after

class ArcaneSurgeGuide extends Analyzer {
  static dependencies = {
    arcaneSurge: ArcaneSurge,
    eventHistory: EventHistory,
  };

  protected arcaneSurge!: ArcaneSurge;
  protected eventHistory!: EventHistory;

  isSpellslinger = this.selectedCombatant.hasTalent(TALENTS.SPLINTERSTORM_TALENT);
  isSunfury = this.selectedCombatant.hasTalent(TALENTS.MEMORY_OF_ALAR_TALENT);

  private evaluateArcaneSurgeCast(cast: ArcaneSurgeData): CastEvaluation {
    const maxSalvoStacks = this.isSunfury ? 25 : 20;
    const activeTimePerf: QualitativePerformance = cast.activeTime
      ? this.arcaneSurge.activeTimeUtil(cast.activeTime)
      : QualitativePerformance.Fail;

    // Fail conditions
    if (this.isSpellslinger && cast.salvoStacks !== maxSalvoStacks) {
      return {
        timestamp: cast.cast,
        performance: QualitativePerformance.Fail,
        reason: `${cast.salvoStacks} Arcane Salvo stacks`,
      };
    }

    if (cast.activeTime && activeTimePerf === QualitativePerformance.Fail) {
      return {
        timestamp: cast.cast,
        performance: QualitativePerformance.Fail,
        reason: `${formatPercentage(cast.activeTime)}% Active Time`,
      };
    }

    if (!cast.activeTime) {
      return {
        timestamp: cast.cast,
        performance: QualitativePerformance.Fail,
        reason: `No Active Time data found. Please report this!`,
      };
    }

    // PERFECT
    if (
      this.isSpellslinger &&
      cast.salvoStacks === maxSalvoStacks &&
      activeTimePerf === QualitativePerformance.Perfect
    ) {
      return {
        timestamp: cast.cast,
        performance: QualitativePerformance.Perfect,
        reason: `${formatPercentage(cast.activeTime)}% Active Time`,
      };
    }

    if (this.isSunfury && activeTimePerf === QualitativePerformance.Perfect) {
      return {
        timestamp: cast.cast,
        performance: QualitativePerformance.Perfect,
        reason: `${formatPercentage(cast.activeTime)}% Active Time`,
      };
    }

    // GOOD
    if (
      this.isSpellslinger &&
      cast.salvoStacks === maxSalvoStacks &&
      activeTimePerf === QualitativePerformance.Good
    ) {
      return {
        timestamp: cast.cast,
        performance: QualitativePerformance.Good,
        reason: `${formatPercentage(cast.activeTime)}% Active Time`,
      };
    }

    if (this.isSunfury && activeTimePerf === QualitativePerformance.Good) {
      return {
        timestamp: cast.cast,
        performance: QualitativePerformance.Good,
        reason: `${formatPercentage(cast.activeTime)}% Active Time`,
      };
    }

    // OK
    if (
      this.isSpellslinger &&
      cast.salvoStacks === maxSalvoStacks &&
      activeTimePerf === QualitativePerformance.Ok
    ) {
      return {
        timestamp: cast.cast,
        performance: QualitativePerformance.Ok,
        reason: `${formatPercentage(cast.activeTime)}% Active Time`,
      };
    }

    if (this.isSpellslinger && cast.salvoStacks < maxSalvoStacks) {
      return {
        timestamp: cast.cast,
        performance: QualitativePerformance.Ok,
        reason: `${cast.salvoStacks} Arcane Salvo Stacks.`,
      };
    }

    if (this.isSunfury && activeTimePerf === QualitativePerformance.Ok) {
      return {
        timestamp: cast.cast,
        performance: QualitativePerformance.Ok,
        reason: `${formatPercentage(cast.activeTime)}% Active Time`,
      };
    }

    // Fallback for any unexpected edge cases
    return {
      timestamp: cast.cast,
      performance: QualitativePerformance.Ok,
      reason: `Unknown Performance Condition. Please report this.`,
    };
  }

  get guideSubsection(): JSX.Element {
    const arcaneSurge = <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />;
    const arcaneSalvo = <SpellLink spell={TALENTS.ARCANE_SALVO_TALENT} />;
    const arcaneBlast = <SpellLink spell={SPELLS.ARCANE_BLAST} />;
    const arcanePulse = <SpellLink spell={TALENTS.ARCANE_PULSE_TALENT} />;
    const touchOfTheMagi = <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />;

    const explanation = (
      <>
        <p>
          <b>{arcaneSurge}</b> is your primary damage cooldown and will essentially convert all of
          your mana into damage and then gives you a massive damage and mana regeneration buff that
          lasts for 15 seconds. There is not much to play around with this cooldown, but casting it
          does begin your major burn phase, so you should ensure you are ready to execute that burn
          phase uninterupted.
        </p>
        {this.isSpellslinger && (
          <p>
            For Spellslinger, you should spam {arcaneBlast} or {arcanePulse} to ensure you have max
            stacks of {arcaneSalvo} before you cast {arcaneSurge}.
          </p>
        )}
        {this.isSunfury && (
          <p>
            For Sunfury, you should spam {arcaneBlast} or {arcanePulse} after {arcaneSurge} to get
            as many {arcaneSalvo} stacks as possible, and then cast {touchOfTheMagi} in the last 4-6
            seconds of {arcaneSurge}.
          </p>
        )}
        <p>
          Below is a sample of what your Major Burn Phase will likely look like:
          {this.isSpellslinger && (
            <SpellSeq
              spells={[
                TALENTS.ARCANE_SALVO_TALENT,
                TALENTS.ARCANE_SURGE_TALENT,
                SPELLS.ARCANE_BARRAGE,
                TALENTS.TOUCH_OF_THE_MAGI_TALENT,
              ]}
            />
          )}
          {this.isSunfury && (
            <SpellSeq
              spells={[
                TALENTS.ARCANE_SURGE_TALENT,
                TALENTS.ARCANE_SALVO_TALENT,
                TALENTS.TOUCH_OF_THE_MAGI_TALENT,
                SPELLS.ARCANE_BARRAGE,
              ]}
            />
          )}
        </p>
        <TipBox type="info">
          While it may seem beneficial to have a high amount of mana before casting {arcaneSurge},
          this is not enough of a meaningful benefit to play around.
        </TipBox>
      </>
    );

    const surgeSequenceEvents: CastSequenceEntry<ArcaneSurgeData>[] =
      this.arcaneSurge.surgeData.map((cast) => {
        const windowStart = cast.cast - SURGE_PRE_WINDOW;
        const windowEnd = cast.cast + SURGE_POST_WINDOW;

        const castEvents = this.eventHistory.getEvents([EventType.Cast], {
          searchBackwards: false,
          startTimestamp: windowStart,
          duration: windowEnd - windowStart,
        });

        const casts: CastInSequence[] = castEvents.map((event) => ({
          timestamp: event.timestamp,
          spellId: event.ability.guid,
          spellName: event.ability.name,
          icon: event.ability.abilityIcon.replace('.jpg', ''),
          performance: undefined,
        }));

        return {
          data: cast,
          start: windowStart,
          end: windowEnd,
          casts,
        };
      });

    return (
      <GuideSection spell={TALENTS.ARCANE_SURGE_TALENT} explanation={explanation}>
        <CastSummary
          spell={TALENTS.ARCANE_SURGE_TALENT}
          casts={this.arcaneSurge.surgeData.map((cast) => this.evaluateArcaneSurgeCast(cast))}
          showBreakdown
        />
        <CastSequence
          spell={TALENTS.ARCANE_SURGE_TALENT}
          sequences={surgeSequenceEvents}
          castTimestamp={(data) => this.owner.formatTimestamp(data.cast)}
          iconSize={40}
        />
      </GuideSection>
    );
  }
}

export default ArcaneSurgeGuide;
