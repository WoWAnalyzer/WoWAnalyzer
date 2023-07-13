import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';

const SubRogueChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );

  return (
    <Checklist>
      <Rule
        name="Use your offensive cooldowns"
        description={
          <>
            Subtlety rotation revolves around using your cooldowns effectively. To maximize your
            damage, you need to stack your cooldowns. Your cooldowns dictate your rotation. A base
            rule of thumb is: use <SpellLink spell={SPELLS.SYMBOLS_OF_DEATH} /> on cooldown, and use{' '}
            <SpellLink spell={SPELLS.SHADOW_DANCE} /> when symbols are active. However you should
            never cap on <SpellLink spell={SPELLS.SHADOW_DANCE} /> charges.
          </>
        }
      >
        <AbilityRequirement spell={SPELLS.SHADOW_DANCE.id} />
        <AbilityRequirement spell={SPELLS.SYMBOLS_OF_DEATH.id} />
        <AbilityRequirement spell={TALENTS.SHADOW_BLADES_TALENT.id} />
        {combatant.hasTalent(TALENTS.SECRET_TECHNIQUE_TALENT) && (
          <AbilityRequirement spell={TALENTS.SECRET_TECHNIQUE_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.SEPSIS_TALENT) && (
          <AbilityRequirement spell={TALENTS.SEPSIS_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.FLAGELLATION_TALENT) && (
          <AbilityRequirement spell={TALENTS.FLAGELLATION_TALENT.id} />
        )}
      </Rule>
      <Rule
        name="Don't waste resources"
        description={
          <>
            Since all of Subtlety's damage is tied to resources, it is important to waste as little
            of them as possible. You should make sure you do not find yourself being Energy capped
            or casting Combo Point generating abilities when at maximum Combo Points.
          </>
        }
      >
        <Requirement name={<>Wasted combo points</>} thresholds={thresholds.comboPoints} />
        <Requirement name={<>Wasted energy</>} thresholds={thresholds.energy} />
      </Rule>
      <Rule
        name="Utilize Stealth and Shadow Dance to full potential"
        description={
          <>
            Stealth is a core mechanic for Subtlety. When using{' '}
            <SpellLink spell={SPELLS.SHADOW_DANCE} />, <SpellLink spell={SPELLS.VANISH} /> or{' '}
            <SpellLink spell={TALENTS.SUBTERFUGE_TALENT} /> you need to make the most of your
            stealth abilities, using up every GCD. To achieve this you might need to pool some
            energy. Depending on your talents, the amount of energy required differs between 60 and
            90. Its also important to use correct spells in stealth, for example{' '}
            <SpellLink spell={SPELLS.BACKSTAB} /> should be replaced by{' '}
            <SpellLink spell={SPELLS.SHADOWSTRIKE} />
          </>
        }
      >
        <Requirement
          name={
            <>
              <TooltipElement content="Includes Subterfuge if talented">
                Casts in Stealth/Vanish*
              </TooltipElement>
            </>
          }
          thresholds={thresholds.castsInStealth}
        />
        <Requirement
          name={
            <>
              Casts in <SpellLink spell={SPELLS.SHADOW_DANCE} />
            </>
          }
          thresholds={thresholds.castsInShadowDance}
        />
        <Requirement
          name={
            <>
              <SpellLink spell={SPELLS.BACKSTAB} /> used from{' '}
              <SpellLink spell={SPELLS.SHADOW_DANCE} />
            </>
          }
          thresholds={thresholds.backstabInShadowDance}
        />
        <Requirement
          name={
            <>
              <SpellLink spell={SPELLS.BACKSTAB} />{' '}
              <TooltipElement content="Includes Vanish and Subterfuge if talented">
                used from Stealth*
              </TooltipElement>
            </>
          }
          thresholds={thresholds.backstabInStealth}
        />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default SubRogueChecklist;
