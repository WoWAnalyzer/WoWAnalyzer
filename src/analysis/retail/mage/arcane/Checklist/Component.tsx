import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';

const ArcaneMageChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
  const AbilityRequirement = (props: AbilityRequirementProps) => {
    const efficiency = castEfficiency.getCastEfficiencyForSpellId(props.spell);
    return efficiency ? (
      <GenericCastEfficiencyRequirement castEfficiency={efficiency} {...props} />
    ) : null;
  };

  return (
    <Checklist>
      <Rule
        name="Always Be Casting"
        description={
          <>
            Any time you are not casting something, that is damage that is lost. Mage has many ways
            to decrease downtime, such as using <SpellLink spell={SPELLS.BLINK} /> to get somewhere
            faster, or <SpellLink spell={TALENTS.ICE_FLOES_TALENT} /> to temporarily cast while
            moving, so you can continue casting; even phases where the only target is taking 99%
            reduced damage is an opportunity to fish for{' '}
            <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} /> procs. While some encounters have
            forced downtime, which WoWAnalyzer does not account for, anything you can do to minimize
            your downtime will help your damage. Additionally, to better contextualize your
            downtime, we recommend comparing your downtime to another Arcane Mage that did better
            than you on the same encounter with roughly the same kill time. If you have less
            downtime than them, then maybe there is something you can do to improve.
          </>
        }
      >
        <Requirement name="Active Time" thresholds={thresholds.downtimeSuggestionThresholds} />
        <Requirement name="Cancelled Casts" thresholds={thresholds.cancelledCasts} />
      </Rule>
      <Rule
        name="Arcane Surge"
        description={
          <>
            Arcane Surge is your hardest hitting ability, and Arcane has a lot of abilities that can
            be layered and stacked to make Arcane Surge hit harder. So to get the most out of Arcane
            Surge, you will want to ensure that all of those layered buffs and abilities are being
            used properly to get the most out of your burn phases.
          </>
        }
      >
        <AbilityRequirement spell={TALENTS.ARCANE_SURGE_TALENT.id} />
      </Rule>
      <Rule
        name="Using your supporting spells and talents"
        description={
          <>
            The bulk of Arcane's damage comes from properly layering and stacking your supporting
            abilities to make your other abilities hit harder. So while it is important for any spec
            to utilize their supporting spells and talents as much as possible to avoid losing
            damage, failure to do so can have a cascading effect on your damage as Arcane and cause
            your harder hitting abilities to not hit nearly as hard as they could have. In
            particular, abilities such as Radiant Spark, Siphon Storm, and Touch of the Magi do a
            lot to elevate your burn phases, so it is important that they are used properly to get
            the most out of them.
          </>
        }
      >
        {combatant.hasTalent(TALENTS.EVOCATION_TALENT) && (
          <AbilityRequirement
            name={
              <>
                <SpellLink spell={TALENTS.EVOCATION_TALENT} /> Cast Efficiency
              </>
            }
            spell={TALENTS.EVOCATION_TALENT.id}
          />
        )}
        <AbilityRequirement
          name={
            <>
              <SpellLink spell={SPELLS.ARCANE_ORB} /> Cast Efficiency
            </>
          }
          spell={SPELLS.ARCANE_ORB.id}
        />
        {combatant.hasTalent(TALENTS.SUPERNOVA_TALENT) && (
          <AbilityRequirement
            name={
              <>
                <SpellLink spell={TALENTS.SUPERNOVA_TALENT} /> Cast Efficiency
              </>
            }
            spell={TALENTS.SUPERNOVA_TALENT.id}
          />
        )}
        {combatant.hasTalent(TALENTS.SHIFTING_POWER_TALENT) && (
          <AbilityRequirement
            name={
              <>
                <SpellLink spell={TALENTS.SHIFTING_POWER_TALENT} /> Cast Efficiency
              </>
            }
            spell={TALENTS.SHIFTING_POWER_TALENT.id}
          />
        )}
      </Rule>
      <Rule
        name={<>Manage your mana</>}
        description={
          <>
            One of the biggest aspects of playing Arcane properly is managing your mana effectively.
            Your mana dictates how much damage you can do and therefore needs to be managed
            properly. Especially as you gain more <SpellLink spell={SPELLS.ARCANE_CHARGE} />
            stacks, your spells will cost more and more mana. Letting your mana cap out at 100% for
            too long, or ending the fight with mana remaining all have negative effects on your DPS.
          </>
        }
      >
        <Requirement name="Mana left on boss kill" thresholds={thresholds.manaOnKill} />
        {combatant.hasTalent(TALENTS.TIME_ANOMALY_TALENT) && (
          <Requirement
            name="Time Anomaly Mana Mgmt."
            thresholds={thresholds.timeAnomalyManaUtilization}
          />
        )}
      </Rule>
      <PreparationRule thresholds={thresholds}>
        <Requirement name="Arcane Intellect active" thresholds={thresholds.arcaneIntellectUptime} />
      </PreparationRule>
    </Checklist>
  );
};

export default ArcaneMageChecklist;
