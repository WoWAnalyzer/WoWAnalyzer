import Combatant from 'parser/core/Combatant';
import SPECS from 'game/SPECS';

export function getMetamorphosisCooldown(combatant: Combatant) {
  if (combatant.spec?.id === SPECS.DEVOURER_DEMON_HUNTER.id) {
    // Devourer has no CD except during Meta
    return 0;
  }

  // Base cooldown for meta is 2min for Havoc and Vengeance
  return 120;
}
