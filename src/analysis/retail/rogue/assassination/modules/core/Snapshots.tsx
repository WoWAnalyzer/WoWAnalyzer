import { BUFF_DROP_BUFFER, StaticSnapshotSpec } from 'parser/core/DotSnapshots';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import { GoodColor, PerfectColor } from 'interface/guide';

// Improved Garrote works off of 3s from last stealth drop
const IMPROVED_GARROTE_STEALTH_BUFFER = 3000 + BUFF_DROP_BUFFER;

export const IMPROVED_GARROTE_SPEC: StaticSnapshotSpec = {
  name: 'Improved Garrote',
  spellFunc: () => [TALENTS.IMPROVED_GARROTE_TALENT],
  isActive: (c) => c.hasTalent(TALENTS.IMPROVED_GARROTE_TALENT),
  isPresent: (c, timestamp) =>
    c.hasBuff(SPELLS.STEALTH.id, timestamp, IMPROVED_GARROTE_STEALTH_BUFFER) ||
    c.hasBuff(SPELLS.STEALTH_BUFF.id, timestamp, IMPROVED_GARROTE_STEALTH_BUFFER) ||
    c.hasBuff(SPELLS.VANISH_BUFF.id, timestamp, IMPROVED_GARROTE_STEALTH_BUFFER) ||
    c.hasBuff(SPELLS.SHADOW_DANCE_BUFF.id, timestamp, IMPROVED_GARROTE_STEALTH_BUFFER) ||
    c.hasBuff(SPELLS.IMPROVED_GARROTE_BUFF.id, timestamp, IMPROVED_GARROTE_STEALTH_BUFFER) ||
    c.hasBuff(SPELLS.SEPSIS_BUFF.id, timestamp, BUFF_DROP_BUFFER),
  displayColor: GoodColor,
  boostStrength: () => 0.5,
};
// TODO Split Sepsis Buff out as its own color to differentiate in the timeline
export const SEPSIS_EMPOWERED_GARROTE_SPEC: StaticSnapshotSpec = {
  name: 'Sepsis Improved Garrote',
  spellFunc: () => [TALENTS.SEPSIS_TALENT, TALENTS.IMPROVED_GARROTE_TALENT],
  isActive: (c) =>
    c.hasTalent(TALENTS.IMPROVED_GARROTE_TALENT) && c.hasTalent(TALENTS.SEPSIS_TALENT),
  isPresent: (c, timestamp) => c.hasBuff(SPELLS.SEPSIS_BUFF.id, timestamp, BUFF_DROP_BUFFER),
  displayColor: PerfectColor,
  boostStrength: () => 0.5,
};
