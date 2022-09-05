import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import EventHistory from 'parser/shared/modules/EventHistory';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class MirrorsOfTormentUsage extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
    eventHistory: EventHistory,
  };
  protected spellUsable!: SpellUsable;
  protected abilityTracker!: AbilityTracker;
  protected eventHistory!: EventHistory;

  combustionWithoutMirrors = 0;
  cappedCharges = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.VENTHYR.id);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.COMBUSTION),
      this.onCombustionCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MIRRORS_OF_TORMENT),
      this.onMirrorsCast,
    );
  }

  onCombustionCast(event: CastEvent) {
    const lastMirrorsCast = this.eventHistory.last(
      1,
      4000,
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MIRRORS_OF_TORMENT),
    );
    if (lastMirrorsCast.length === 0) {
      this.combustionWithoutMirrors += 1;
    }
  }

  onMirrorsCast(event: CastEvent) {
    const fireBlastCharges = this.spellUsable.chargesAvailable(SPELLS.FIRE_BLAST.id);
    const maxCharges = this.selectedCombatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) ? 3 : 2;
    if (fireBlastCharges === maxCharges) {
      this.cappedCharges += 1;
    }
  }

  get percentCombustionWithoutMirrors() {
    return (
      1 - this.combustionWithoutMirrors / this.abilityTracker.getAbility(SPELLS.COMBUSTION.id).casts
    );
  }

  get percentCappedCharges() {
    return (
      1 - this.cappedCharges / this.abilityTracker.getAbility(SPELLS.MIRRORS_OF_TORMENT.id).casts
    );
  }

  get combustionWithoutMirrorsThresholds() {
    return {
      actual: this.percentCombustionWithoutMirrors,
      isLessThan: {
        average: 1,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get cappedChargesThresholds() {
    return {
      actual: this.percentCappedCharges,
      isLessThan: {
        average: 1,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.combustionWithoutMirrorsThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink id={SPELLS.COMBUSTION.id} /> without casting{' '}
          <SpellLink id={SPELLS.MIRRORS_OF_TORMENT.id} /> first {this.combustionWithoutMirrors}{' '}
          times. If you are Venthyr, you should ensure that you are using{' '}
          <SpellLink id={SPELLS.MIRRORS_OF_TORMENT.id} /> before{' '}
          <SpellLink id={SPELLS.COMBUSTION.id} /> to get as many{' '}
          <SpellLink id={SPELLS.FIRE_BLAST.id} /> charges as possible, allowing you to get more{' '}
          <SpellLink id={SPELLS.PYROBLAST.id} /> casts in before{' '}
          <SpellLink id={SPELLS.COMBUSTION.id} /> finishes.
        </>,
      )
        .icon(SPELLS.MIRRORS_OF_TORMENT.icon)
        .actual(
          <Trans id="mage.fire.suggestions.mirrorsOfTorment.combustionWithoutMirrors">
            {formatPercentage(actual)}% utilization
          </Trans>,
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
    when(this.cappedChargesThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You finished casting <SpellLink id={SPELLS.MIRRORS_OF_TORMENT.id} /> while capped on{' '}
          <SpellLink id={SPELLS.FIRE_BLAST.id} /> charges {this.cappedCharges} times. To avoid
          capping charges, you should use a charge of <SpellLink id={SPELLS.FIRE_BLAST.id} /> during
          your <SpellLink id={SPELLS.MIRRORS_OF_TORMENT.id} /> cast, that way when{' '}
          <SpellLink id={SPELLS.MIRRORS_OF_TORMENT.id} /> refunds a charge of{' '}
          <SpellLink id={SPELLS.FIRE_BLAST.id} />, it will not be wasted.
        </>,
      )
        .icon(SPELLS.MIRRORS_OF_TORMENT.icon)
        .actual(
          <Trans id="mage.fire.suggestions.mirrorsOfTorment.cappedCharges">
            {formatPercentage(actual)}% utilization
          </Trans>,
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default MirrorsOfTormentUsage;
