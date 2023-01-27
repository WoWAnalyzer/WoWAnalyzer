import { BUFF_DROP_BUFFER, StaticSnapshotSpec } from 'parser/core/DotSnapshots';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import { NIGHTSTALKER_DAMAGE_BUFF } from 'analysis/retail/rogue/shared';

export const NIGHTSTALKER_SPEC: StaticSnapshotSpec = {
  name: 'Nightstalker',
  spellFunc: () => [TALENTS.NIGHTSTALKER_TALENT],
  isActive: (c) => c.hasTalent(TALENTS.NIGHTSTALKER_TALENT),
  isPresent: (c, timestamp) =>
    c.hasBuff(SPELLS.STEALTH.id, timestamp, BUFF_DROP_BUFFER) ||
    c.hasBuff(SPELLS.STEALTH_BUFF.id, timestamp, BUFF_DROP_BUFFER) ||
    c.hasBuff(SPELLS.VANISH_BUFF.id, timestamp, BUFF_DROP_BUFFER) ||
    c.hasBuff(SPELLS.SHADOW_DANCE_BUFF.id, timestamp, BUFF_DROP_BUFFER),
  displayColor: '#5555ff',
  boostStrength: (c) => NIGHTSTALKER_DAMAGE_BUFF[c.getTalentRank(TALENTS.NIGHTSTALKER_TALENT)],
};

export const IMPROVED_GARROTE_SPEC: StaticSnapshotSpec = {
  name: 'Improved Garrote',
  spellFunc: () => [TALENTS.IMPROVED_GARROTE_TALENT],
  isActive: (c) => c.hasTalent(TALENTS.IMPROVED_GARROTE_TALENT),
  isPresent: (c, timestamp) =>
    c.hasBuff(SPELLS.STEALTH.id, timestamp, BUFF_DROP_BUFFER) ||
    c.hasBuff(SPELLS.STEALTH_BUFF.id, timestamp, BUFF_DROP_BUFFER) ||
    c.hasBuff(SPELLS.VANISH_BUFF.id, timestamp, BUFF_DROP_BUFFER) ||
    c.hasBuff(SPELLS.SHADOW_DANCE_BUFF.id, timestamp, BUFF_DROP_BUFFER),
  displayColor: '#dd0022',
  boostStrength: (c) => NIGHTSTALKER_DAMAGE_BUFF[c.getTalentRank(TALENTS.NIGHTSTALKER_TALENT)],
};
