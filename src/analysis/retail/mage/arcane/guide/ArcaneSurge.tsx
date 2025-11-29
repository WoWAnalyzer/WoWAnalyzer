import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { SpellSeq } from 'parser/ui/SpellSeq';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Analyzer from 'parser/core/Analyzer';
import GuideSection from 'interface/guide/components/GuideSection';
import { type CastEvaluation } from 'interface/guide/components/CastSummary';
import {
  type ExpandableConfig,
  ExpandableBreakdown,
  createExpandableConfig,
} from '../../shared/components';

import ArcaneSurge, { ArcaneSurgeData } from '../analyzers/ArcaneSurge';

const ARCANE_CHARGE_MAX_STACKS = 4;
const OPENER_DURATION = 20000;
const SHORT_FIGHT_DURATION = 60000;

class ArcaneSurgeGuide extends Analyzer {
  static dependencies = {
    arcaneSurge: ArcaneSurge,
  };

  protected arcaneSurge!: ArcaneSurge;

  hasSiphonStorm: boolean = this.selectedCombatant.hasTalent(TALENTS.EVOCATION_TALENT);

  /**
   * Evaluates a single Arcane Surge cast for CastSummary.
   * Returns performance and reason for tooltip display.
   *
   * Evaluation priority: fail → perfect → good → ok → default
   */
  private evaluateArcaneSurgeCast(cast: ArcaneSurgeData): CastEvaluation {
    const opener = cast.cast - this.owner.fight.start_time < OPENER_DURATION;
    const hasMaxCharges = cast.charges === ARCANE_CHARGE_MAX_STACKS || opener;
    const fightTimeRemaining = this.owner.fight.end_time - cast.cast;
    const shortFight = fightTimeRemaining < SHORT_FIGHT_DURATION;

    if (!hasMaxCharges) {
      return {
        timestamp: cast.cast,
        performance: QualitativePerformance.Fail,
        reason: opener
          ? `Opener with ${cast.charges}/${ARCANE_CHARGE_MAX_STACKS} charges`
          : `Only ${cast.charges}/${ARCANE_CHARGE_MAX_STACKS} charges - need 4 or cast Arcane Orb first`,
      };
    }

    // Perfect conditions
    if (hasMaxCharges && (!this.hasSiphonStorm || cast.siphonStormBuff)) {
      return {
        timestamp: cast.cast,
        performance: QualitativePerformance.Perfect,
        reason: opener
          ? 'Perfect opener with available buffs'
          : 'Perfect combo: max charges + all available buffs (Siphon Storm + Nether Precision)',
      };
    }

    // Good conditions
    if (hasMaxCharges && cast.siphonStormBuff) {
      return {
        timestamp: cast.cast,
        performance: QualitativePerformance.Good,
        reason: `Good usage: ${cast.charges} charges + Siphon Storm`,
      };
    }

    if (hasMaxCharges && shortFight) {
      return {
        timestamp: cast.cast,
        performance: QualitativePerformance.Good,
        reason: 'Good emergency usage - short fight/encounter ending',
      };
    }

    // Ok/default
    if (hasMaxCharges) {
      return {
        timestamp: cast.cast,
        performance: QualitativePerformance.Ok,
        reason: opener
          ? `Opener usage with ${cast.charges} charges`
          : `Basic usage with ${cast.charges} charges - could optimize with buffs`,
      };
    }

    // Fallback (should not reach here due to fail condition above)
    return {
      timestamp: cast.cast,
      performance: QualitativePerformance.Fail,
      reason: 'Suboptimal Arcane Surge usage',
    };
  }

  private get expandableConfig(): ExpandableConfig {
    return createExpandableConfig({
      spell: TALENTS.ARCANE_SURGE_TALENT,
      formatTimestamp: (timestamp: number) => this.owner.formatTimestamp(timestamp),
      getTimestamp: (cast: unknown) => (cast as ArcaneSurgeData).cast,
      checklistItems: [
        {
          label: (
            <>
              <SpellLink spell={SPELLS.ARCANE_CHARGE} />s Before Surge
            </>
          ),
          getResult: (cast: unknown) => {
            const surgeCast = cast as ArcaneSurgeData;
            const opener = surgeCast.cast - this.owner.fight.start_time < OPENER_DURATION;
            return surgeCast.charges === ARCANE_CHARGE_MAX_STACKS || opener;
          },
          getDetails: (cast: unknown) => {
            const surgeCast = cast as ArcaneSurgeData;
            const opener = surgeCast.cast - this.owner.fight.start_time < OPENER_DURATION;
            return opener
              ? `${surgeCast.charges}/${ARCANE_CHARGE_MAX_STACKS} charges (opener)`
              : `${surgeCast.charges}/${ARCANE_CHARGE_MAX_STACKS} charges`;
          },
        },
        {
          label: (
            <>
              <SpellLink spell={SPELLS.SIPHON_STORM_BUFF} /> Active
            </>
          ),
          getResult: (cast: unknown) => (cast as ArcaneSurgeData).siphonStormBuff,
          getDetails: (cast: unknown) =>
            (cast as ArcaneSurgeData).siphonStormBuff ? 'Active' : 'Not active',
        },
      ],
    });
  }

  get guideSubsection(): JSX.Element {
    const arcaneOrb = <SpellLink spell={SPELLS.ARCANE_ORB} />;
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const arcaneSurge = <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />;
    const evocation = <SpellLink spell={TALENTS.EVOCATION_TALENT} />;
    const clearcasting = <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />;
    const arcaneMissiles = <SpellLink spell={TALENTS.ARCANE_MISSILES_TALENT} />;
    const siphonStorm = <SpellLink spell={SPELLS.SIPHON_STORM_BUFF} />;

    const explanation = (
      <>
        <b>{arcaneSurge}</b> is your primary damage cooldown and will essentially convert all of
        your mana into damage. Because of this, there are a few things that you should do to ensure
        you maximize the amount of damage that {arcaneSurge} does:
        <ul>
          <li>
            Ensure you have 4 {arcaneCharge}s. Cast {arcaneOrb} if you have less than 4.
          </li>
          <li>
            Full channel {evocation} before each {arcaneSurge} cast to cap your mana and grant an
            intellect buff from {siphonStorm}.
          </li>
          <li>
            Channeling {evocation} will give you a {clearcasting} proc. Cast {arcaneMissiles} to get
            before {arcaneSurge}
          </li>
        </ul>
        When incorporating the above items, your spell sequence will look like this:{' '}
        <SpellSeq
          spells={[
            TALENTS.EVOCATION_TALENT,
            TALENTS.ARCANE_MISSILES_TALENT,
            SPELLS.ARCANE_ORB,
            TALENTS.ARCANE_SURGE_TALENT,
          ]}
        />
      </>
    );

    return (
      <GuideSection spell={TALENTS.ARCANE_SURGE_TALENT} explanation={explanation}>
        <ExpandableBreakdown
          castData={this.arcaneSurge.surgeData}
          evaluatedData={this.arcaneSurge.surgeData.map((cast) => {
            const evaluation = this.evaluateArcaneSurgeCast(cast);
            return {
              value: evaluation.performance,
              tooltip: evaluation.reason,
            };
          })}
          expandableConfig={this.expandableConfig}
        />
      </GuideSection>
    );
  }
}

export default ArcaneSurgeGuide;
