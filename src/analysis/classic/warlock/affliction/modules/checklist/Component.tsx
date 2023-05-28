import SPELLS from 'common/SPELLS/classic/warlock';
import { SpellLink } from 'interface';
import PreparationRule from 'parser/classic/modules/features/Checklist/PreparationRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  ChecklistProps,
  DotUptimeProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';

const ClassicAfflictionChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
  const DotUptime = (props: DotUptimeProps) => (
    <Requirement
      name={
        <>
          <SpellLink id={props.id} icon /> uptime
        </>
      }
      thresholds={props.thresholds}
    />
  );

  return (
    <Checklist>
      <Rule
        name="Maintain your DoTs and debuffs"
        description="Affliction Warlocks rely heavily on DoTs to deal damage. Try to keep your DoT uptime as high as possible."
      >
        <DotUptime id={SPELLS.CURSE_OF_AGONY.id} thresholds={thresholds.curseOfAgony} />
        <DotUptime id={SPELLS.CORRUPTION.id} thresholds={thresholds.corruption} />
        {combatant.talentPoints[0] >= 50 && (
          <DotUptime id={SPELLS.HAUNT.id} thresholds={thresholds.haunt} />
        )}
        <DotUptime id={SPELLS.UNSTABLE_AFFLICTION.id} thresholds={thresholds.unstableAffliction} />
      </Rule>
      <Rule
        name="Always Be Casting"
        description={
          <>
            Try to avoid downtime during the fight. When moving, use your instant abilities or set
            up{' '}
            <SpellLink id={SPELLS.DEMONIC_CIRCLE_TELEPORT} icon>
              Demonic Circle
            </SpellLink>{' '}
            to reduce your movement.
          </>
        }
      >
        <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default ClassicAfflictionChecklist;
