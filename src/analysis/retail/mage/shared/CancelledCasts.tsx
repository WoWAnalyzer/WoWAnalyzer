import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import SPECS from 'game/SPECS';
import { SpellLink } from 'interface';
import { Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import CoreCancelledCasts from 'parser/shared/modules/CancelledCasts';

class CancelledCasts extends CoreCancelledCasts {
  constructor(options: Options) {
    super(options);
    this.IGNORED_ABILITIES = [
      //Include the spells that you do not want to be tracked and spells that are castable while casting (Like Fire Blast, Combustion, or Shimmer)
      SPELLS.FIRE_BLAST.id,
      TALENTS.COMBUSTION_TALENT.id,
      TALENTS.SHIMMER_TALENT.id,
      TALENTS.ICE_FLOES_TALENT.id,
    ];
  }

  get cancelledPercentage() {
    return this.castsCancelled / this.totalCasts;
  }

  get suggestionThresholds() {
    return {
      actual: this.cancelledPercentage,
      isGreaterThan: {
        minor: 0.05,
        average: 0.1,
        major: 0.2,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    let extraMovementSpell: any = null;
    if (this.selectedCombatant.specId === SPECS.FROST_MAGE.id) {
      extraMovementSpell = (
        <>
          , and <SpellLink spell={TALENTS.ICE_FLOES_TALENT} />
        </>
      );
    } else if (this.selectedCombatant.specId === SPECS.ARCANE_MAGE.id) {
      extraMovementSpell = (
        <>
          , and <SpellLink spell={TALENTS.SLIPSTREAM_TALENT} />
        </>
      );
    }
    const joiner = extraMovementSpell === null ? ' and ' : ', ';

    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cancelled {formatPercentage(this.cancelledPercentage)}% of your spells. While it is
          expected that you will have to cancel a few casts to react to boss mechanics or move, you
          should try to ensure that you are cancelling as few casts as possible by utilizing
          movement abilities such as <SpellLink spell={SPELLS.BLINK} />
          {joiner}
          <SpellLink spell={TALENTS.SHIMMER_TALENT} />
          {extraMovementSpell}.
        </>,
      )
        .icon('inv_misc_map_01')
        .actual(
          <Trans id="mage.shared.suggestions.castsCancelled">
            {formatPercentage(actual)}% casts cancelled
          </Trans>,
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default CancelledCasts;
