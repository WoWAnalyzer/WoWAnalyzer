import { t, Trans } from '@lingui/macro';
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
    <Section
      title={t({
        id: 'guide.gunter.beastmastery.sections.rotation.title',
        message: 'Rotation',
      })}
    >
      <SubSection
        title={t({
          id: 'guide.hunter.beastmastery.sections.rotation.core.title',
          message: 'Core Rotation',
        })}
      >
        {info.combatant.hasTalent(TALENTS.BARBED_SHOT_TALENT) &&
          modules.barbedShot.guideSubsection()}
      </SubSection>
      <SubSection
        title={t({
          id: 'guide.hunter.beastmastery.sections.rotation.cooldowns.title',
          message: 'Cooldowns',
        })}
      >
        <Trans id="guide.hunter.beastmastery.sections.rotation.core.graph">
          <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how
          long you waited to use them again. Grey segments show when the spell was available, yellow
          segments show when the spell was cooling down. Red segments highlight times when you could
          have fit a whole extra use of the cooldown.
        </Trans>
        {info.combatant.hasTalent(TALENTS.BESTIAL_WRATH_TALENT) && (
          <CastEfficiencyBar
            spellId={TALENTS.BESTIAL_WRATH_TALENT.id}
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
      <SubSection
        title={t({
          id: 'guide.hunter.beastmastery.sections.rotation.frenzy.title',
          message: 'Frenzy Graph',
        })}
      >
        <p>
          <Trans id="guide.hunter.beastmastery.sections.rotation.frenzy.summary">
            This graph shows the number of stacks of{' '}
            <SpellLink spell={SPELLS.BARBED_SHOT_PET_BUFF} /> you had. You want to maintain{' '}
            {MAX_FRENZY_STACKS} stacks as much as possible to maximize your damage.
          </Trans>
        </p>
        {modules.frenzyBuffStackGraph.plot}
      </SubSection>
    </Section>
  );
}
