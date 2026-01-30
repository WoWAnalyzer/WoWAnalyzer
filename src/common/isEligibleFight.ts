import { type WCLFight } from 'parser/core/Fight';

export const isEligibleFight = (fight: WCLFight) => fight.boss !== 0;
