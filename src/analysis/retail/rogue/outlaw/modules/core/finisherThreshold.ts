import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import Combatant from 'parser/core/Combatant';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import { getMaxComboPoints } from '../../constants';

/**
 * SimC's `variable.finish_condition`, and the single definition of the threshold:
 *   combo_points >= cp_max_spend - 1
 *     - ( !cooldown.between_the_eyes.ready & ( hero_tree.fatebound | cooldown.killing_spree.ready ) )
 * Deal Fate stands in for Fatebound. Pass `castSpellId` so the cooldown it just started still counts.
 */
export const finisherComboPointThreshold = (
  combatant: Combatant,
  spellUsable: SpellUsable,
  castSpellId?: number,
): number => {
  const betweenTheEyesReady =
    castSpellId === SPELLS.BETWEEN_THE_EYES.id ||
    spellUsable.isAvailable(SPELLS.BETWEEN_THE_EYES.id);

  const killingSpreeReady =
    combatant.hasTalent(TALENTS.KILLING_SPREE_TALENT) &&
    (castSpellId === TALENTS.KILLING_SPREE_TALENT.id ||
      spellUsable.isAvailable(TALENTS.KILLING_SPREE_TALENT.id));

  const finishEarlier =
    !betweenTheEyesReady && (combatant.hasTalent(TALENTS.DEAL_FATE_TALENT) || killingSpreeReady);

  return getMaxComboPoints(combatant) - 1 - (finishEarlier ? 1 : 0);
};
