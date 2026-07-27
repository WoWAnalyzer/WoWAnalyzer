import Spell from 'common/SPELLS/Spell';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import { SpellLink } from 'interface';
import { useInfo } from 'interface/guide';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import {
  AplViolationExplainers,
  defaultExplainers,
} from 'interface/guide/components/Apl/violations/claims';
import { Apl, CheckResult, Violation } from 'parser/shared/metrics/apl';

import { getMaxComboPoints } from '../../constants';

const FINISHERS = [
  SPELLS.BETWEEN_THE_EYES.id,
  TALENTS.KILLING_SPREE_TALENT.id,
  SPELLS.COUP_DE_GRACE_CAST.id,
  SPELLS.DISPATCH.id,
];

const isFinisher = (spellId: number) => FINISHERS.includes(spellId);

const comboPointsOnCast = (violation: Violation) =>
  violation.actualCast.classResources?.find(
    (resource) => resource.type === RESOURCE_TYPES.COMBO_POINTS.id,
  );

const comboPointsSpent = (violation: Violation): number => {
  const resource = comboPointsOnCast(violation);
  const cost = resource?.cost ?? 0;
  return cost > 0 ? cost : (resource?.amount ?? 0);
};

const comboPointText = (comboPoints: number) =>
  `${comboPoints} Combo Point${comboPoints === 1 ? '' : 's'}`;

const expectedMatches = (violation: Violation, spell: Spell) =>
  violation.expectedCast.some((expected) => expected.id === spell.id);

/** A Dispatch at the Between the Eyes threshold is that mistake, not a missed Killing Spree. */
const isReallyABetweenTheEyesMistake = (violation: Violation, maxComboPoints: number) =>
  expectedMatches(violation, TALENTS.KILLING_SPREE_TALENT) &&
  violation.actualCast.ability.guid === SPELLS.DISPATCH.id &&
  comboPointsSpent(violation) >= maxComboPoints;

/** Appended to the generic description, which already names the rule and failed condition. */
function OutlawViolationNote({ violation }: { violation: Violation }) {
  const info = useInfo();
  const spellId = violation.actualCast.ability.guid;
  const spent = comboPointsSpent(violation);
  const maxComboPoints = info?.combatant ? getMaxComboPoints(info.combatant) : 5;

  if (isFinisher(spellId) && spent > 0 && spent < maxComboPoints - 1) {
    return (
      <p>
        This cast only spent <strong>{comboPointText(spent)}</strong>. Outlaw spends at{' '}
        <strong>{comboPointText(maxComboPoints - 1)}</strong> or more, so this wasted most of a
        finisher.
      </p>
    );
  }

  const currentComboPoints = comboPointsOnCast(violation)?.amount;
  if (
    spellId === TALENTS.ADRENALINE_RUSH_TALENT.id &&
    currentComboPoints !== undefined &&
    currentComboPoints >= maxComboPoints - 1
  ) {
    return (
      <p>
        This cast was made with <strong>{comboPointText(currentComboPoints)}</strong>, which wastes
        the Combo Points granted by <SpellLink spell={TALENTS.IMPROVED_ADRENALINE_RUSH_TALENT} />.
        Spend before using <SpellLink spell={TALENTS.ADRENALINE_RUSH_TALENT} />.
      </p>
    );
  }

  return null;
}

/** The shared `droppedRule` explainer plus two Outlaw additions; keeps the 40% violation gate. */
const droppedRule: typeof defaultExplainers.droppedRule = {
  ...defaultExplainers.droppedRule,
  claim: (apl: Apl, result: CheckResult) => {
    const maxComboPoints = result.violations.length
      ? Math.max(
          ...result.violations.map(
            (violation) =>
              comboPointsOnCast(violation)?.max ?? comboPointsOnCast(violation)?.amount ?? 5,
          ),
        )
      : 5;

    return defaultExplainers.droppedRule.claim(apl, {
      ...result,
      violations: result.violations.filter(
        (violation) => !isReallyABetweenTheEyesMistake(violation, maxComboPoints),
      ),
    });
  },
  describe: (props) => (
    <>
      {defaultExplainers.droppedRule.describe(props)}
      <OutlawViolationNote violation={props.violation} />
    </>
  ),
};

export const outlawExplainers: AplViolationExplainers = {
  ...defaultExplainers,
  droppedRule,
};

export const __test = {
  OutlawViolationNote,
};
