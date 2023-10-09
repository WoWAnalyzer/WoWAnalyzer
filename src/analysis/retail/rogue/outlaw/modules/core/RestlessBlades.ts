import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { SpendResourceEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import TALENTS from 'common/TALENTS/rogue';

/**
 * Restless Blades
 * Finishing moves reduce the remaining cooldown of the abilities listed below by 1 sec per combo point spent.
 */

const AFFECTED_ABILITIES: number[] = [
  TALENTS.ADRENALINE_RUSH_TALENT.id,
  SPELLS.BETWEEN_THE_EYES.id,
  SPELLS.SPRINT.id,
  SPELLS.GRAPPLING_HOOK.id,
  TALENTS.GHOSTLY_STRIKE_TALENT.id,
  TALENTS.BLADE_RUSH_TALENT.id,
  TALENTS.KILLING_SPREE_TALENT.id,
  SPELLS.VANISH.id,
  SPELLS.ROLL_THE_BONES.id,
  TALENTS.KEEP_IT_ROLLING_TALENT.id,
  SPELLS.BLADE_FLURRY.id,
];

export const RESTLESS_BLADES_BASE_CDR = 1000;
export const TRUE_BEARING_CDR = 500;

class RestlessBlades extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.SpendResource.by(SELECTED_PLAYER), this.onSpendResource);
  }

  onSpendResource(event: SpendResourceEvent) {
    const spent = event.resourceChange;
    if (event.resourceChangeType !== RESOURCE_TYPES.COMBO_POINTS.id) {
      return;
    }

    const cdr =
      RESTLESS_BLADES_BASE_CDR +
      (this.selectedCombatant.hasBuff(SPELLS.TRUE_BEARING.id) ? TRUE_BEARING_CDR : 0);

    const amount = cdr * spent;

    AFFECTED_ABILITIES.forEach((spell) => this.reduceCooldown(spell, amount));
  }

  reduceCooldown(spellId: number, amount: number) {
    if (this.spellUsable.isOnCooldown(spellId)) {
      this.spellUsable.reduceCooldown(spellId, amount);
    }
  }
}

export default RestlessBlades;
