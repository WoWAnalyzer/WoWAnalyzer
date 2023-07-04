import { SpellLink } from 'interface';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  ChecklistProps,
  DotUptimeProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import PreparationRule from 'parser/classic/modules/features/Checklist/PreparationRule';
import SPELLS from 'common/SPELLS/classic';

const PriestChecklist = ({ thresholds, castEfficiency, combatant }: ChecklistProps) => {
  const DotUptime = (props: DotUptimeProps) => (
    <Requirement
      name={
        <>
          <SpellLink spell={props.spell} icon /> uptime
        </>
      }
      thresholds={props.thresholds}
    />
  );

  return (
    <Checklist>
      <Rule
        name="Maintain your DoTs on the boss"
        description={
          <>
            DoTs are a big part of your damage. You should try to keep as high uptime on them as
            possible, but do not refresh them too early. Try to cast{' '}
            <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> after applying 5 stacks of{' '}
            <SpellLink id={SPELLS.SHADOW_WEAVING_TALENT.id} />
          </>
        }
      >
        <DotUptime spell={SPELLS.SHADOW_WORD_PAIN} thresholds={thresholds.shadowWordPain} />
        <DotUptime spell={SPELLS.VAMPIRIC_TOUCH} thresholds={thresholds.vampiricTouch} />
        <DotUptime spell={SPELLS.DEVOURING_PLAGUE} thresholds={thresholds.devouringPlague} />
      </Rule>
      {/* Enchants and Consumes */}
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default PriestChecklist;
