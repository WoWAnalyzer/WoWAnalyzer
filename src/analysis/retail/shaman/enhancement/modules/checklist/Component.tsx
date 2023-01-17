import SPELLS from 'common/SPELLS';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import { SpellLink } from 'interface';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import AplRule, { AplRuleProps } from 'parser/shared/metrics/apl/ChecklistRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';

const EnhancementShamanChecklist = (props: ChecklistProps & AplRuleProps) => {
  const { combatant, castEfficiency, thresholds } = props;
  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      isMaxCasts
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );

  return (
    <Checklist>
      <Rule
        name="Always be casting"
        description={
          <>
            You should try to avoid doing nothing during the fight. If you have to move, try casting
            something instant with range like <SpellLink id={SPELLS.FLAME_SHOCK.id} />,{' '}
            <SpellLink id={TALENTS_SHAMAN.FROST_SHOCK_TALENT.id} />, or an instant{' '}
            <SpellLink id={SPELLS.LIGHTNING_BOLT.id} />/
            <SpellLink id={TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT.id} />
          </>
        }
      >
        <Requirement name="Downtime" thresholds={thresholds.alwaysBeCasting} />
      </Rule>
      <Rule
        name="Use your offensive cooldowns as often as possible"
        description={
          <>
            You should aim to use your offensive cooldowns as often as you can to maximize your
            damage output.{' '}
            <a
              href="https://www.wowhead.com/enhancement-shaman-rotation-guide#offensive-defensive-cooldowns"
              target="_blank"
              rel="noopener noreferrer"
            >
              More info.
            </a>
          </>
        }
      >
        <AbilityRequirement spell={TALENTS_SHAMAN.FERAL_SPIRIT_TALENT.id} />
        {combatant.hasTalent(TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT) && (
          <AbilityRequirement spell={TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT.id} />
        )}
        {false && <AbilityRequirement spell={TALENTS_SHAMAN.PRIMORDIAL_WAVE_TALENT.id} />}
      </Rule>
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

      {/* <Rule
        name="Maintain your buffs"
        description={"You should maintain your buffs in order to passively increase your damage done to targets without refreshing them to early."}
      >
        <Requirement name={<> <SpellLink id={SPELLS.LIGHTNING_SHIELD.id} /> uptime</>} thresholds={thresholds.lightningShieldUptime} />
        TODO: ADD LASHING FLAMES UPTIME IF TALENTED
      </Rule> */}

      <AplRule
        {...props}
        name="Single Target APL checker (beta)"
        cooldowns={[
          // TODO: Enable talent as spell
          // TALENTS_SHAMAN.FERAL_SPIRIT_TALENT,
          // TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT,
          TALENTS_SHAMAN.PRIMORDIAL_WAVE_TALENT,
        ]}
      />
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default EnhancementShamanChecklist;
