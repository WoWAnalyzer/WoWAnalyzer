import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { SpellLink } from 'interface';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
  DotUptimeProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';

const DemonologyWarlockChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
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
            Demonology has a lot of short cooldowns that make up majority of your rotation, such as{' '}
            <SpellLink id={SPELLS.CALL_DREADSTALKERS.id} /> or Felguard's{' '}
            <SpellLink id={SPELLS.FELSTORM_BUFF.id} />. Try to use them as much as possible.
          </>
        }
      >
        <AbilityRequirement spell={SPELLS.CALL_DREADSTALKERS.id} />
        <Requirement
          name={<SpellLink id={SPELLS.FELSTORM_BUFF.id} />}
          thresholds={thresholds.felstorm}
        />
        {combatant.hasTalent(TALENTS.BILESCOURGE_BOMBERS_TALENT) && (
          <AbilityRequirement spell={TALENTS.BILESCOURGE_BOMBERS_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.POWER_SIPHON_TALENT) && (
          <AbilityRequirement spell={TALENTS.POWER_SIPHON_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.DOOM_TALENT) && (
          <DotUptime id={TALENTS.DOOM_TALENT.id} thresholds={thresholds.doom} />
        )}
        {combatant.hasTalent(TALENTS.SOUL_STRIKE_TALENT) && (
          <AbilityRequirement spell={TALENTS.SOUL_STRIKE_TALENT.id} />
        )}
      </Rule>
      <Rule name="Don't cap your Soul Shards" description="Avoid overcapping Soul Shards.">
        <Requirement name="Wasted shards per minute" thresholds={thresholds.soulShards} />
      </Rule>
      {combatant.hasTalent(TALENTS.FEL_COVENANT_TALENT) && (
        <Rule
          name="Keep Fel Covenant buff up"
          description={
            <>
              You should aim to have 100% uptime on <SpellLink id={SPELLS.FEL_COVENANT_BUFF.id} />
            </>
          }
        >
          <Requirement
            name={
              <>
                <SpellLink id={TALENTS.FEL_COVENANT_TALENT.id} /> uptime
              </>
            }
            thresholds={thresholds.felCovenant}
          />
        </Rule>
      )}
      <Rule
        name="Use your cooldowns"
        description="Be mindful of your cooldowns if you are specced into them and use them when it's appropriate. It's okay to hold a cooldown for a little bit when the encounter requires it (burn phases), but generally speaking you should use them as much as you can."
      >
        <AbilityRequirement spell={SPELLS.SUMMON_DEMONIC_TYRANT.id} />
        {combatant.hasTalent(TALENTS.DEMONIC_STRENGTH_TALENT) && (
          <AbilityRequirement spell={TALENTS.DEMONIC_STRENGTH_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.SUMMON_VILEFIEND_TALENT) && (
          <AbilityRequirement spell={TALENTS.SUMMON_VILEFIEND_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.GRIMOIRE_FELGUARD_TALENT) && (
          <AbilityRequirement spell={TALENTS.GRIMOIRE_FELGUARD_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.NETHER_PORTAL_TALENT) && (
          <AbilityRequirement spell={TALENTS.NETHER_PORTAL_TALENT.id} />
        )}
      </Rule>
      <Rule
        name="Use your utility and defensive spells"
        description={
          <>
            Use other spells in your toolkit to your advantage. For example, you can try to minimize
            necessary movement by using <SpellLink id={SPELLS.DEMONIC_GATEWAY_CAST.id} icon />,{' '}
            <SpellLink id={SPELLS.DEMONIC_CIRCLE.id} icon />,{' '}
            <SpellLink id={TALENTS.BURNING_RUSH_TALENT.id} icon /> or mitigate incoming damage with{' '}
            <SpellLink id={SPELLS.UNENDING_RESOLVE.id} icon />/
            <SpellLink id={TALENTS.DARK_PACT_TALENT.id} icon />.<br />
            While you shouldn't cast these defensives on cooldown, be aware of them and use them
            whenever effective. Not using them at all indicates you might not be aware of them or
            not using them optimally.
          </>
        }
      >
        <AbilityRequirement spell={SPELLS.DEMONIC_CIRCLE_TELEPORT.id} />
        {combatant.hasTalent(TALENTS.DARK_PACT_TALENT) && (
          <AbilityRequirement spell={TALENTS.DARK_PACT_TALENT.id} />
        )}
        <AbilityRequirement spell={SPELLS.UNENDING_RESOLVE.id} />
      </Rule>
      <Rule
        name="Always be casting"
        description={
          <>
            You should try to avoid doing nothing during the fight. When you're waiting for
            cooldowns, keep building Soul Shards to summon additional Wild Imps. When you have to
            move, use your instant abilities like <SpellLink id={SPELLS.DEMONBOLT.id} /> (with
            Demonic Core) or <SpellLink id={TALENTS.SOUL_STRIKE_TALENT.id} /> or try to utilize{' '}
            <SpellLink id={SPELLS.DEMONIC_CIRCLE.id} icon>
              Teleport
            </SpellLink>{' '}
            or{' '}
            <SpellLink id={SPELLS.DEMONIC_GATEWAY_CAST.id} icon>
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

export default DemonologyWarlockChecklist;
