import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellLink } from 'interface';
import PreparationRule from 'parser/shadowlands/modules/features/Checklist/PreparationRule';
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
            <SpellLink id={SPELLS.FROST_SHOCK.id} />, or an instant{' '}
            <SpellLink id={SPELLS.LIGHTNING_BOLT.id} />/<SpellLink id={SPELLS.CHAIN_LIGHTNING.id} />
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
        <AbilityRequirement spell={SPELLS.FERAL_SPIRIT.id} />
        {combatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ENHANCEMENT.id) && (
          <AbilityRequirement spell={SPELLS.ASCENDANCE_TALENT_ENHANCEMENT.id} />
        )}
        {combatant.hasCovenant(COVENANTS.KYRIAN.id) && (
          <AbilityRequirement spell={SPELLS.VESPER_TOTEM.id} />
        )}
        {combatant.hasCovenant(COVENANTS.NECROLORD.id) && (
          <AbilityRequirement spell={SPELLS.PRIMORDIAL_WAVE_CAST.id} />
        )}
        {combatant.hasCovenant(COVENANTS.NIGHT_FAE.id) && (
          <AbilityRequirement spell={SPELLS.FAE_TRANSFUSION.id} />
        )}
        {combatant.hasCovenant(COVENANTS.VENTHYR.id) && (
          <AbilityRequirement spell={SPELLS.CHAIN_HARVEST.id} />
        )}
        {combatant.hasTalent(SPELLS.STORMKEEPER_TALENT_ENHANCEMENT.id) && (
          <AbilityRequirement spell={SPELLS.STORMKEEPER_TALENT_ENHANCEMENT.id} />
        )}
        {combatant.hasTalent(SPELLS.EARTHEN_SPIKE_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.EARTHEN_SPIKE_TALENT.id} />
        )}
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
          SPELLS.FERAL_SPIRIT,
          SPELLS.ASCENDANCE_TALENT_ENHANCEMENT,
          SPELLS.VESPER_TOTEM,
          SPELLS.PRIMORDIAL_WAVE_CAST,
          SPELLS.FAE_TRANSFUSION,
          SPELLS.CHAIN_HARVEST,
        ]}
      />
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default EnhancementShamanChecklist;
