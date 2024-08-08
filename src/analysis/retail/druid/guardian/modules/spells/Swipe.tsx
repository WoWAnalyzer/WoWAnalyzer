import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { Options } from 'parser/core/Module';
import Events, { CastEvent } from 'parser/core/Events';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { cdSpell, inBerserk } from 'analysis/retail/druid/guardian/constants';

export default class Swipe extends Analyzer.withDependencies({ spellUsable: SpellUsable }) {
  castEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SWIPE_BEAR),
      this.onSwipeCast,
    );
  }

  onSwipeCast(event: CastEvent) {
    const hasBerserk = inBerserk(this.selectedCombatant);
    const remainingThrashCd = this.deps.spellUsable.cooldownRemaining(SPELLS.THRASH_BEAR.id);
    const remainingMangleCd = this.deps.spellUsable.cooldownRemaining(SPELLS.MANGLE_BEAR.id);

    const value =
      remainingThrashCd <= 1000 || remainingMangleCd <= 1000 || hasBerserk
        ? QualitativePerformance.Fail
        : QualitativePerformance.Good;
    const tooltip = (
      <>
        @<strong>{this.owner.formatTimestamp(event.timestamp)}</strong>
        <br />
        {hasBerserk && (
          <>
            in <SpellLink spell={cdSpell(this.selectedCombatant)} /> (Mangle or Thrash always
            available)
            <br />
          </>
        )}
        {remainingMangleCd === 0 && (
          <>
            <SpellLink spell={SPELLS.MANGLE_BEAR} /> was available
            <br />
          </>
        )}
        {remainingMangleCd > 0 && remainingMangleCd < 1000 && (
          <>
            <SpellLink spell={SPELLS.MANGLE_BEAR} /> is available in{' '}
            {(remainingMangleCd / 1000).toFixed(1)} seconds.
            <br />
          </>
        )}
        {remainingThrashCd === 0 && (
          <>
            <SpellLink spell={SPELLS.THRASH_BEAR} /> was available
            <br />
          </>
        )}
        {remainingThrashCd > 0 && remainingThrashCd < 1000 && (
          <>
            <SpellLink spell={SPELLS.THRASH_BEAR} /> is available in{' '}
            {(remainingThrashCd / 1000).toFixed(1)} seconds.
            <br />
          </>
        )}
      </>
    );

    this.castEntries.push({
      value,
      tooltip,
    });
  }

  get guideSubsection() {
    const explanation = (
      <>
        <p>
          <strong>
            <SpellLink spell={SPELLS.SWIPE_BEAR} />
          </strong>{' '}
          is your filler spell. It does not generate rage and does very weak damage. Swipe is barely
          better than an empty GCD and shouldn't be used if it delays another ability - even by a
          little.
        </p>
        <p>
          <strong>Generally speaking, it's fine not to use Swipe at all.</strong>
        </p>
      </>
    );

    const chartDescription =
      ' - Green is an acceptable cast, Red is when another spell was available or almost available';

    const data =
      this.castEntries.length !== 0 ? (
        <div>
          <strong>Swipe casts</strong>
          <small>{chartDescription}</small>
          <PerformanceBoxRow values={this.castEntries} />
        </div>
      ) : (
        <div>
          <strong>You never used Swipe this encounter.</strong>
        </div>
      );

    return explanationAndDataSubsection(explanation, data);
  }
}
