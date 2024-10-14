import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PassFailCheckmark } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';
import { SpellSeq } from 'parser/ui/SpellSeq';

import ArcaneSurge, { ArcaneSurgeCast } from '../core/ArcaneSurge';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { ARCANE_CHARGE_MAX_STACKS } from '../../shared';

const OPENER_DURATION = 20000;

class ArcaneSurgeGuide extends Analyzer {
  static dependencies = {
    arcaneSurge: ArcaneSurge,
  };

  protected arcaneSurge!: ArcaneSurge;

  hasSiphonStorm: boolean = this.selectedCombatant.hasTalent(TALENTS.EVOCATION_TALENT);
  hasNetherPrecision: boolean = this.selectedCombatant.hasTalent(TALENTS.NETHER_PRECISION_TALENT);

  private perCastBreakdown(cast: ArcaneSurgeCast): React.ReactNode {
    const header = (
      <>
        @ {this.owner.formatTimestamp(cast.cast)} &mdash;{' '}
        <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />
      </>
    );

    const checklistItems: CooldownExpandableItem[] = [];

    const maxCharges = cast.charges === ARCANE_CHARGE_MAX_STACKS;
    const opener = cast.cast - this.owner.fight.start_time < OPENER_DURATION;
    checklistItems.push({
      label: (
        <>
          <SpellLink spell={SPELLS.ARCANE_CHARGE} />s Before Surge
        </>
      ),
      result: <PassFailCheckmark pass={maxCharges || (!maxCharges && opener)} />,
      details: (
        <>
          {cast.charges} {opener ? '(Opener)' : ''}
        </>
      ),
    });

    if (this.selectedCombatant.hasTalent(TALENTS.EVOCATION_TALENT)) {
      checklistItems.push({
        label: (
          <>
            <SpellLink spell={SPELLS.SIPHON_STORM_BUFF} /> Active
          </>
        ),
        result: <PassFailCheckmark pass={cast.siphonStormBuff} />,
        details: <>{cast.siphonStormBuff ? `Buff Active` : `Buff Missing`}</>,
      });
    }

    if (this.selectedCombatant.hasTalent(TALENTS.NETHER_PRECISION_TALENT)) {
      checklistItems.push({
        label: (
          <>
            <SpellLink spell={TALENTS.NETHER_PRECISION_TALENT} /> Active
          </>
        ),
        result: <PassFailCheckmark pass={cast.netherPrecision} />,
        details: <>{cast.netherPrecision ? `Buff Active` : `Buff Missing`}</>,
      });
    }

    const perf =
      (maxCharges || (!maxCharges && opener)) &&
      (!this.hasSiphonStorm || cast.siphonStormBuff) &&
      (!this.hasNetherPrecision || cast.netherPrecision)
        ? QualitativePerformance.Good
        : QualitativePerformance.Fail;

    return (
      <CooldownExpandable
        header={header}
        checklistItems={checklistItems}
        perf={perf}
        key={cast.ordinal}
      />
    );
  }

  get guideSubsection(): JSX.Element {
    const arcaneOrb = <SpellLink spell={SPELLS.ARCANE_ORB} />;
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const arcaneSurge = <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />;
    const evocation = <SpellLink spell={TALENTS.EVOCATION_TALENT} />;
    const clearcasting = <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />;
    const arcaneMissiles = <SpellLink spell={TALENTS.ARCANE_MISSILES_TALENT} />;
    const netherPrecision = <SpellLink spell={TALENTS.NETHER_PRECISION_TALENT} />;
    const siphonStorm = <SpellLink spell={SPELLS.SIPHON_STORM_BUFF} />;

    const explanation = (
      <>
        <div>
          <b>{arcaneSurge}</b> is your primary damage cooldown and will essentially convert all of
          your mana into damage. Because of this, there are a few things that you should do to
          ensure you maximize the amount of damage that {arcaneSurge} does:
        </div>
        <div>
          <ul>
            <li>
              Ensure you have 4 {arcaneCharge}s. Cast {arcaneOrb} if you have less than 4.
            </li>
            <li>
              Full channel {evocation} before each {arcaneSurge} cast to cap your mana and grant an
              intellect buff from {siphonStorm}.
            </li>
            <li>
              Channeling {evocation} will give you a {clearcasting} proc. Cast {arcaneMissiles} to
              get {netherPrecision} before {arcaneSurge}
            </li>
          </ul>
        </div>
        <div>
          When incorporating the above items, your spell sequence will look like this:{' '}
          <SpellSeq
            spells={[
              TALENTS.EVOCATION_TALENT,
              TALENTS.ARCANE_MISSILES_TALENT,
              SPELLS.ARCANE_ORB,
              TALENTS.ARCANE_SURGE_TALENT,
            ]}
          />
        </div>
      </>
    );
    const data = (
      <div>
        <RoundedPanel>
          <div>
            <p>
              <strong>Per-Cast Breakdown</strong>
              <small> - click to expand</small>
              {this.arcaneSurge.surgeCasts.map((cast) => this.perCastBreakdown(cast))}
            </p>
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Arcane Surge',
    );
  }
}

export default ArcaneSurgeGuide;
