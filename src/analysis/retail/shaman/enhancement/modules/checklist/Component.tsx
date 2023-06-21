import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import AplRule, { AplRuleProps } from 'parser/shared/metrics/apl/ChecklistRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import { ChecklistProps } from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';

const EnhancementShamanChecklist = (props: ChecklistProps & AplRuleProps) => {
  const { thresholds } = props;
  return (
    <Checklist>
      <Rule
        name="Keep your Windfury Totem active"
        description={
          <>
            You should aim to have 100% uptime on <SpellLink id={SPELLS.WINDFURY_TOTEM_BUFF.id} />
          </>
        }
      >
        <Requirement
          name={
            <>
              <SpellLink id={SPELLS.WINDFURY_TOTEM_BUFF.id} /> uptime
            </>
          }
          thresholds={thresholds.windfuryTotemUptime}
        />
      </Rule>

      <AplRule {...props} name="Single Target APL checker (beta)" />
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default EnhancementShamanChecklist;
