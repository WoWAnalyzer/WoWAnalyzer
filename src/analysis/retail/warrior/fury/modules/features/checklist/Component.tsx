import SPELLS from 'common/SPELLS';
import { TALENTS_WARRIOR } from 'common/TALENTS';
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

const FuryWarriorChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );

  return (
    <Checklist>
      <Rule
        name="Use cooldowns effectively"
        description="Your cooldowns are an important contributor to your damage throughput. Try to get in as many efficient casts as the fight allows."
      >
        <AbilityRequirement spell={SPELLS.RECKLESSNESS.id} />
        <Requirement
          name={
            <>
              <SpellLink spell={SPELLS.WHIRLWIND_FURY_CAST} />{' '}
            </>
          }
          thresholds={thresholds.whirlWind}
        />
        {/* We can't detect race, so disable this when it has never been cast. */}
        {castEfficiency.getCastEfficiencyForSpellId(SPELLS.ARCANE_TORRENT_RAGE.id) && (
          <AbilityRequirement spell={SPELLS.ARCANE_TORRENT_RAGE.id} />
        )}
      </Rule>
      <Rule
        name="Use Rampage"
        description={
          <>
            Using <SpellLink spell={SPELLS.RAMPAGE} /> is an important part of the Fury rotation. If
            you aren't Enraged, <SpellLink spell={SPELLS.RAMPAGE} /> should be used as soon as you
            have enough rage. Efficient use of <SpellLink spell={SPELLS.RAMPAGE} /> is especially
            important with the
            <SpellLink spell={TALENTS_WARRIOR.ANGER_MANAGEMENT_TALENT} /> talent.
          </>
        }
      >
        <Requirement
          name={
            <>
              Number of times a builder was used instead of <SpellLink spell={SPELLS.RAMPAGE} />
            </>
          }
          thresholds={thresholds.missedRampage}
        />
      </Rule>
      <Rule
        name="Use your defensive cooldowns"
        description="While you shouldn't cast these defensives on cooldown, be aware of them and use them whenever effective. Not using them at all indicates you might not be aware of them or not using them optimally."
      >
        <AbilityRequirement spell={SPELLS.ENRAGED_REGENERATION.id} />
        <AbilityRequirement spell={SPELLS.RALLYING_CRY.id} />
      </Rule>
      <Rule
        name="Avoid downtime"
        description={
          <>
            As a melee DPS, it is important to stay within range of the target and cast your
            abiltiies promptly. If you find yourself out of range, try using{' '}
            <SpellLink spell={SPELLS.CHARGE} /> and <SpellLink spell={SPELLS.HEROIC_LEAP} /> to get
            back more quickly.
          </>
        }
      >
        <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
      </Rule>

      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};
export default FuryWarriorChecklist;
