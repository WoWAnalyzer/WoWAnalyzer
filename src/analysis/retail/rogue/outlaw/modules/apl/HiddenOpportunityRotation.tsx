import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import { and, buffPresent, or, describe, buffStacks } from 'parser/shared/metrics/apl/conditions';
import { build, Rule, tenseAlt } from 'parser/shared/metrics/apl';
import { SpellLink } from 'interface';
import { buffsCount } from './buffsCount';
import { ROLL_THE_BONES_BUFFS } from '../../constants';
import { notInSubterfugeSoon } from './notInSubterfugeSoon';
import { finisherComboPointAmount } from './comboPointAmount';

const hasHOLowCPFinisherCondition = () => {
  return and(
    describe(
      or(
        buffPresent(SPELLS.SUBTERFUGE_BUFF),
        buffPresent(SPELLS.AUDACITY_TALENT_BUFF),
        buffPresent(SPELLS.OPPORTUNITY),
      ),
      (tense) => (
        <>
          <SpellLink spell={SPELLS.SUBTERFUGE_BUFF} />,{' '}
          <SpellLink spell={SPELLS.AUDACITY_TALENT_BUFF} /> or{' '}
          <SpellLink spell={SPELLS.OPPORTUNITY} /> {tenseAlt(tense, 'is', 'was')} present
        </>
      ),
    ),
    finisherComboPointAmount(5),
  );
};

const hasHONoStealthLowCPFinisherCondition = () => {
  return and(
    describe(
      or(buffPresent(SPELLS.AUDACITY_TALENT_BUFF), buffPresent(SPELLS.OPPORTUNITY)),
      (tense) => (
        <>
          <SpellLink spell={SPELLS.AUDACITY_TALENT_BUFF} /> or{' '}
          <SpellLink spell={SPELLS.OPPORTUNITY} /> {tenseAlt(tense, 'is', 'was')} present
        </>
      ),
    ),
    finisherComboPointAmount(5),
  );
};

const rtbCondition = () => {
  return buffsCount(ROLL_THE_BONES_BUFFS, 5, 'lessThan');
};

const COOLDOWNS: Rule[] = [
  {
    spell: SPELLS.ROLL_THE_BONES,
    condition: rtbCondition(),
  },
];

const FINISHERS: Rule[] = [
  {
    spell: TALENTS.KILLING_SPREE_TALENT,
    condition: and(notInSubterfugeSoon(), finisherComboPointAmount(6)),
  },
  {
    spell: TALENTS.KILLING_SPREE_TALENT,
    condition: and(notInSubterfugeSoon(), hasHONoStealthLowCPFinisherCondition()),
  },
  {
    spell: SPELLS.COUP_DE_GRACE_CAST,
    condition: and(
      buffStacks(SPELLS.COUP_DE_GRACE_BUFF, { atLeast: 4 }),
      notInSubterfugeSoon(),
      finisherComboPointAmount(6),
    ),
  },
  {
    spell: SPELLS.COUP_DE_GRACE_CAST,
    condition: and(
      buffStacks(SPELLS.COUP_DE_GRACE_BUFF, { atLeast: 4 }),
      notInSubterfugeSoon(),
      hasHONoStealthLowCPFinisherCondition(),
    ),
  },
  {
    spell: SPELLS.BETWEEN_THE_EYES,
    condition: finisherComboPointAmount(6),
  },
  {
    spell: SPELLS.BETWEEN_THE_EYES,
    condition: hasHOLowCPFinisherCondition(),
  },
  {
    spell: SPELLS.DISPATCH,
    condition: finisherComboPointAmount(6),
  },
  {
    spell: SPELLS.DISPATCH,
    condition: hasHOLowCPFinisherCondition(),
  },
];

const BUILDERS: Rule[] = [
  {
    spell: SPELLS.AMBUSH,
    condition: or(
      // we add a 100ms offset to prevent pistol shots proccing audacity from being flagged incorrectly
      buffPresent(SPELLS.AUDACITY_TALENT_BUFF, 100),
      describe(
        or(
          buffPresent(SPELLS.SUBTERFUGE_BUFF),
          buffPresent(SPELLS.STEALTH_BUFF),
          buffPresent(SPELLS.VANISH_BUFF),
        ),
        (tense) => <>you {tenseAlt(tense, 'are', 'were')} in stealth stance</>,
      ),
    ),
  },
  {
    spell: SPELLS.PISTOL_SHOT,
    condition: buffPresent(SPELLS.OPPORTUNITY),
  },
  SPELLS.SINISTER_STRIKE,
];

export const hidden_opportunity_rotation = build([...COOLDOWNS, ...FINISHERS, ...BUILDERS]);
