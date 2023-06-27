import { GuideProps, Section, SubSection } from 'interface/guide';
import CombatLogParser from 'analysis/retail/hunter/beastmastery/CombatLogParser';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import TALENTS from 'common/TALENTS/hunter';
import SPELLS from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';
import { MAX_FRENZY_STACKS } from 'analysis/retail/hunter/beastmastery/constants';

export default function RotationSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Rotation">
      <SubSection title="Core Rotation">
        {info.combatant.hasTalent(TALENTS.BARBED_SHOT_TALENT) &&
          modules.barbedShot.guideSubsection()}
      </SubSection>
      <SubSection title="Cooldowns">
        <>
          <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how
          long you waited to use them again. Grey segments show when the spell was available, yellow
          segments show when the spell was cooling down. Red segments highlight times when you could
          have fit a whole extra use of the cooldown.
        </>
        {info.combatant.hasTalent(TALENTS.BESTIAL_WRATH_TALENT) && (
          <CastEfficiencyBar
            spellId={TALENTS.BESTIAL_WRATH_TALENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
            minimizeIcons
          />
        )}
        {info.combatant.hasTalent(TALENTS.DEATH_CHAKRAM_TALENT) && (
          <CastEfficiencyBar
            spellId={TALENTS.DEATH_CHAKRAM_TALENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
            minimizeIcons
          />
        )}
        {info.combatant.hasTalent(TALENTS.DIRE_BEAST_TALENT) && (
          <CastEfficiencyBar
            spellId={TALENTS.DIRE_BEAST_TALENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
            minimizeIcons
          />
        )}
        {info.combatant.hasTalent(TALENTS.BLOODSHED_TALENT) && (
          <CastEfficiencyBar
            spellId={TALENTS.BLOODSHED_TALENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
            minimizeIcons
          />
        )}
      </SubSection>
      <SubSection title="Frenzy Graph">
        <p>
          <>
            This graph shows the number of stacks of{' '}
            <SpellLink id={SPELLS.BARBED_SHOT_PET_BUFF.id} /> you had. You want to maintain{' '}
            {MAX_FRENZY_STACKS} stacks as much as possible to maximize your damage.
          </>
        </p>
        {modules.frenzyBuffStackGraph.plot}
      </SubSection>
    </Section>
  );
}
