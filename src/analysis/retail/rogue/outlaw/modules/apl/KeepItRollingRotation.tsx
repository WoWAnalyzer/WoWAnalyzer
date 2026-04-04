import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import {
  and,
  buffMissing,
  buffPresent,
  or,
  buffStacks,
  always,
  lastSpellCast,
} from 'parser/shared/metrics/apl/conditions';
import { build, Rule } from 'parser/shared/metrics/apl';
import { buffsCount } from './buffsCount';
import { ROLL_THE_BONES_BUFFS } from '../../constants';
import { builderComboPointAmount, finisherComboPointAmount } from './comboPointAmount';

const hasLowCPFinisherCondition = () => {
  return and(buffPresent(SPELLS.SUBTERFUGE_BUFF), finisherComboPointAmount(5));
};

const rtbKirCondition = () => {
  return or(
    buffPresent(ROLL_THE_BONES_BUFFS[2]) ||
      buffPresent(ROLL_THE_BONES_BUFFS[3]) ||
      buffPresent(ROLL_THE_BONES_BUFFS[4]),

    // buffsCount(ROLL_THE_BONES_BUFFS, 3, 'lessThan'),
    // Could be cast another cast over due to OGCD spells etc, so we we just wrap it in always
    always(lastSpellCast(TALENTS.KEEP_IT_ROLLING_TALENT)),
  );
};

const COOLDOWNS: Rule[] = [
  {
    spell: TALENTS.KEEP_IT_ROLLING_TALENT,
    condition:
      buffPresent(ROLL_THE_BONES_BUFFS[2]) ||
      buffPresent(ROLL_THE_BONES_BUFFS[3]) ||
      buffPresent(ROLL_THE_BONES_BUFFS[4]),
  },
  {
    spell: SPELLS.ROLL_THE_BONES,
    condition: rtbKirCondition(),
  },
];

const FINISHERS: Rule[] = [
  {
    spell: TALENTS.KILLING_SPREE_TALENT,
    condition: and(finisherComboPointAmount(6)),
  },
  {
    spell: SPELLS.COUP_DE_GRACE_CAST,
    condition: and(
      buffStacks(SPELLS.COUP_DE_GRACE_BUFF, { atLeast: 4 }),
      finisherComboPointAmount(6),
    ),
  },
  {
    spell: SPELLS.BETWEEN_THE_EYES,
    condition: finisherComboPointAmount(6),
  },
  {
    spell: SPELLS.BETWEEN_THE_EYES,
    condition: hasLowCPFinisherCondition(),
  },
  {
    spell: SPELLS.DISPATCH,
    condition: finisherComboPointAmount(5),
  },
  {
    spell: SPELLS.DISPATCH,
    condition: hasLowCPFinisherCondition(),
  },
];

const BUILDERS: Rule[] = [
  {
    spell: SPELLS.PISTOL_SHOT,
    condition: and(buffPresent(SPELLS.OPPORTUNITY), builderComboPointAmount(2)),
  },
  {
    spell: SPELLS.PISTOL_SHOT,
    condition: and(buffPresent(SPELLS.OPPORTUNITY), builderComboPointAmount(3)),
  },
  SPELLS.SINISTER_STRIKE,
];

export const keep_it_rolling_rotation = build([...COOLDOWNS, ...FINISHERS, ...BUILDERS]);
