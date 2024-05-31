import Config, { Build } from './Config';
import { CombatantInfoEvent } from './core/Events';
import GameBranch from 'game/GameBranch';

function compareBuilds(buildA: number[], buildB: number[]) {
  let total = 0;
  for (let i = 0; i < 3; i = i + 1) {
    total = total + Math.abs(buildA[i] - buildB[i]);
  }

  return total;
}

export default function getBuild(
  config: Config | undefined,
  combatant: CombatantInfoEvent,
): Build | null {
  if (!config?.builds || config.branch !== GameBranch.Classic) {
    return null;
  }

  const talents = combatant.talents.reduce((accum: number[], spell) => {
    if (spell != null) {
      accum.push(spell.id);
    }

    return accum;
  }, [] as number[]);

  // Expecting vanilla and tbc talents in the form of 3 numbers
  if (talents.length !== 3) {
    return null;
  }

  let buildComparison = Object.values(config.builds).map((build) => ({
    build: build,
    score: compareBuilds(talents, build.talents),
  }));

  buildComparison = buildComparison.sort((a, b) => a.score - b.score);

  if (buildComparison[0].score < 50) {
    return buildComparison[0].build;
  }

  return null;
}
