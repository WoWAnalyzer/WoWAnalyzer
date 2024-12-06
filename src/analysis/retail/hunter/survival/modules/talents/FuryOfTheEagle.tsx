import TALENTS from 'common/TALENTS/hunter';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, CastEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import AverageTargetsHit from 'parser/ui/AverageTargetsHit';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
//Guide
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { BadColor, GoodColor } from 'interface/guide';
/**
 * Attack all nearby enemies in cone in front of you in a flurry of strikes, inflicting Physical damage to each. Deals reduced damage beyond 5 targets.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/GcyfdwP1XTJrR3h7#fight=15&source=8&type=damage-done&ability=212436
 */

class FuryOfTheEagle extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  useEntries: BoxRowEntry[] = [];
  private targetsHit: number = 0;
  private casts: number = 0;
  private damage: number = 0;
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.FURY_OF_THE_EAGLE_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FURY_OF_THE_EAGLE_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.FURY_OF_THE_EAGLE_TALENT),
      this.onCast,
    );
  }
  get avgTargetsHitThreshold() {
    return {
      actual: Number((this.targetsHit / this.casts).toFixed(1)),
      isLessThan: {
        minor: 1,
        average: 1,
        major: 1,
      },
      style: ThresholdStyle.DECIMAL,
    };
  }

  onCast(event: CastEvent) {
    const targetName = this.owner.getTargetName(event);
    let value: QualitativePerformance = QualitativePerformance.Good;
    let perfExplanation: React.ReactNode = undefined;
    this.casts += 1;
    if (this.selectedCombatant.hasOwnBuff(SPELLS.TIP_OF_THE_SPEAR_CAST.id)) {
      value = QualitativePerformance.Good;
      perfExplanation = (
        <h5 style={{ color: GoodColor }}>
          GOOD!
          <br />
        </h5>
      );
    } else {
      value = QualitativePerformance.Fail;
      perfExplanation = (
        <h5 style={{ color: BadColor }}>
          Bad! Always cast with Tip!
          <br />
        </h5>
      );
    }
    const tooltip = (
      <>
        {perfExplanation}@ <strong>{this.owner.formatTimestamp(event.timestamp)}</strong> targetting{' '}
        <strong>{targetName || 'unknown'}</strong>
        <br />
      </>
    );
    this.useEntries.push({
      value,
      tooltip,
    });
  }

  onDamage(event: DamageEvent) {
    this.targetsHit += 1;
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS.FURY_OF_THE_EAGLE_TALENT}>
          <ItemDamageDone amount={this.damage} />
          <br />
          <AverageTargetsHit casts={this.casts} hits={this.targetsHit} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS.FURY_OF_THE_EAGLE_TALENT} />
        </strong>{' '}
        should always be cast with <SpellLink spell={SPELLS.TIP_OF_THE_SPEAR_CAST.id} />. Holding
        Fury of the Eagle in Single Target is acceptable if AoE damage is imminent.
      </p>
    );

    const data = (
      <div>
        <CastSummaryAndBreakdown
          spell={TALENTS.FURY_OF_THE_EAGLE_TALENT}
          castEntries={this.useEntries}
          usesInsteadOfCasts
        />
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

export default FuryOfTheEagle;
