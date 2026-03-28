import ITEMS from 'common/ITEMS/midnight/trinkets';
import SPELLS from 'common/SPELLS/midnight/trinkets';
import { TALENTS_HUNTER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Abilities from 'parser/core/modules/Abilities';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
/**
 * Emberwing Feather ΓÇö on-use Haste trinket from Windrunner Spire (Emberdawn).
 * Should be used with Trueshot for maximum burst window value.
 * Flags casts that occur outside of a Trueshot window after the first cast.
 */
export default class EmberwingFeather extends Analyzer.withDependencies({
  abilities: Abilities,
}) {
  casts = 0;
  castsInsideTrueshot = 0;
  castsOutsideTrueshot = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.EMBERWING_FEATHER.id);
    if (!this.active) {
      return;
    }
    this.deps.abilities.add({
      spell: SPELLS.EMBERWING_HEATWAVE.id,
      category: SPELL_CATEGORY.COOLDOWNS,
      cooldown: 120,
      gcd: null,
    });
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EMBERWING_HEATWAVE),
      this.onCast,
    );
  }
  onCast(event: CastEvent) {
    this.casts += 1;
    const inTrueshot = this.selectedCombatant.hasBuff(TALENTS_HUNTER.TRUESHOT_TALENT.id);
    if (inTrueshot) {
      this.castsInsideTrueshot += 1;
    } else {
      this.castsOutsideTrueshot += 1;
      if (this.casts > 1) {
        addInefficientCastReason(
          event,
          'Emberwing Feather used outside of Trueshot. Use it with Trueshot for maximum burst value.',
        );
      }
    }
  }
}
