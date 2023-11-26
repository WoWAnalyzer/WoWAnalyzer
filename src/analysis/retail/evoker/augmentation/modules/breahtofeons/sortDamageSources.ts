import CombatLogParser from '../../CombatLogParser';
import { DamageSources } from './BreathOfEonsHelper';

const sortDamageSources = (damageSources: DamageSources[], owner: CombatLogParser) => {
  const playerDammies = damageSources.find(
    (sourceID) => sourceID.sourceID === owner.selectedCombatant.id,
  );

  const sortedDamageWindow: DamageSources[] = damageSources
    // Filter out fake entries and the player
    .filter(
      (sourceID) => sourceID.sourceID !== -1 && sourceID.sourceID !== owner.selectedCombatant.id,
    )
    .sort((a, b) => b.damage - a.damage)
    .splice(0, 4);
  // Add back the player (if they did damage)
  if (playerDammies) {
    sortedDamageWindow.push(playerDammies);
  }

  return sortedDamageWindow;
};

export default sortDamageSources;
