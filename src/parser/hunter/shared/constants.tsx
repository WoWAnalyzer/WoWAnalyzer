export const KILL_SHOT_EXECUTE_RANGE = 0.2;
export const OVER_1_GCD_BUFFER = 2000;

export const hastedCooldown = (baseCD: number, haste: number) => (baseCD / (1 + haste));
