import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
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

import SoulShardTracker from '../../soulshards/SoulShardTracker';

interface Props extends ChecklistProps {
  shardTracker: SoulShardTracker;
}

const DestructionWarlockChecklist = ({
  combatant,
  castEfficiency,
  thresholds,
  shardTracker,
}: Props) => {
  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );

  return (
    <Checklist>
      <Rule
        name="Use your core spells"
        description={
          <>
            Destruction Warlocks have a simple rotation core. Maintain your{' '}
            <SpellLink spell={SPELLS.IMMOLATE} /> on all enemies if possible, don't waste your{' '}
            <SpellLink spell={SPELLS.CONFLAGRATE} /> and <SpellLink spell={SPELLS.BACKDRAFT} />{' '}
            stacks. Use <SpellLink spell={SPELLS.HAVOC} /> whenever there's something else to
            cleave.
          </>
        }
      >
        <Requirement
          name={
            <>
              <SpellLink spell={SPELLS.IMMOLATE} /> uptime
            </>
          }
          thresholds={thresholds.immolate}
        />
        <AbilityRequirement spell={SPELLS.CONFLAGRATE.id} />
        <Requirement
          name={
            <>
              Wasted <SpellLink spell={SPELLS.BACKDRAFT} /> stacks per minute
            </>
          }
          thresholds={thresholds.wastedBackdraft}
        />
      </Rule>
      <Rule
        name="Don't cap your Soul Shard Fragments"
        description="Soul Shards are your most important resource and since you are in control of their generation, it's very important to plan your rotation and not let them cap."
      >
        <Requirement
          name="Wasted fragments per minute"
          thresholds={thresholds.soulShards}
          valueTooltip={`You wasted ${shardTracker.wasted} fragments.`}
        />
      </Rule>
      <Rule
        name="Use your cooldowns and talents"
        description="Be mindful of your talent choices and use them when it's appropriate. It's okay to hold on a cooldown for a little bit when the encounter requires it (burn phases or priority targets), but generally speaking you should use them as much as you can."
      >
        {combatant.hasTalent(TALENTS.ERADICATION_TALENT) && (
          <Requirement
            name={
              <>
                <SpellLink spell={TALENTS.ERADICATION_TALENT} /> uptime
              </>
            }
            thresholds={thresholds.eradication}
          />
        )}
        {combatant.hasTalent(TALENTS.SHADOWBURN_TALENT) && (
          <AbilityRequirement spell={TALENTS.SHADOWBURN_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.CATACLYSM_TALENT) && (
          <AbilityRequirement spell={TALENTS.CATACLYSM_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.CHANNEL_DEMONFIRE_TALENT) && (
          <AbilityRequirement spell={TALENTS.CHANNEL_DEMONFIRE_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.SOUL_FIRE_TALENT) && (
          <AbilityRequirement spell={TALENTS.SOUL_FIRE_TALENT.id} />
        )}
        <AbilityRequirement spell={SPELLS.SUMMON_INFERNAL.id} />
      </Rule>
      <Rule
        name="Use your utility and defensive spells"
        description={
          <>
            Use other spells in your toolkit to your advantage. For example, you can try to minimize
            necessary movement by using <SpellLink spell={SPELLS.DEMONIC_GATEWAY_CAST} icon />,{' '}
            <SpellLink spell={SPELLS.DEMONIC_CIRCLE} icon />,{' '}
            <SpellLink spell={TALENTS.BURNING_RUSH_TALENT} icon /> or mitigate incoming damage with{' '}
            <SpellLink spell={SPELLS.UNENDING_RESOLVE} icon />/
            <SpellLink spell={TALENTS.DARK_PACT_TALENT} icon />.<br />
            You can use 3 <SpellLink spell={SPELLS.DEMONIC_HEALTHSTONE} icon /> if you have{' '}
            <SpellLink spell={TALENTS.PACT_OF_GLUTTONY_TALENT} icon /> talented.
            <br />
            While you shouldn't cast these defensives on cooldown, be aware of them and use them
            whenever effective. Not using them at all indicates you might not be aware of them or
            not using them optimally.
          </>
        }
      >
        {combatant.hasTalent(TALENTS.DARK_PACT_TALENT) && (
          <AbilityRequirement spell={TALENTS.DARK_PACT_TALENT.id} />
        )}
        <AbilityRequirement spell={SPELLS.UNENDING_RESOLVE.id} />
        {combatant.hasTalent(TALENTS.PACT_OF_GLUTTONY_TALENT) && (
          <AbilityRequirement spell={SPELLS.DEMONIC_HEALTHSTONE.id} />
        )}
      </Rule>
      <Rule
        name="Always be casting"
        description={
          <>
            You should try to avoid doing nothing during the fight. When you have to move, try to
            save some <SpellLink spell={SPELLS.CONFLAGRATE} /> charges or try to utilize{' '}
            <SpellLink spell={SPELLS.DEMONIC_CIRCLE} icon>
              Teleport
            </SpellLink>{' '}
            or{' '}
            <SpellLink spell={SPELLS.DEMONIC_GATEWAY_CAST} icon>
              Gateway
            </SpellLink>{' '}
            to reduce the movement even further.
          </>
        }
      >
        <Requirement name="Downtime" thresholds={thresholds.downtime} />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default DestructionWarlockChecklist;
