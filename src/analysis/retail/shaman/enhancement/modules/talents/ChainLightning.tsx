import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import { EnhancementEventLinks } from '../../constants';

/**
 * Hurls a lightning bolt at the enemy, dealing (63.5% of Spell power) Nature damage and then jumping to additional nearby enemies. Affects 3 total targets.
 */
class ChainLightning extends Analyzer.withDependencies({ spellUsable: SpellUsable }) {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.CHAIN_LIGHTNING_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.CHAIN_LIGHTNING_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    const hits =
      event._linkedEvents?.filter(
        (le) => le.relation === EnhancementEventLinks.CHAIN_LIGHTNING_LINK,
      ).length || 0;

    if (hits < 2) {
      addInefficientCastReason(
        event,
        <>
          <SpellLink spell={TALENTS.CHAIN_LIGHTNING_TALENT} /> only hit one target
        </>,
      );
    }
  }
}

export default ChainLightning;
