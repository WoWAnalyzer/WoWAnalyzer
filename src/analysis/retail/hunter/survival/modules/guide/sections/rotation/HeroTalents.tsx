import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from 'analysis/retail/hunter/survival/CombatLogParser';
export default function HeroSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section
      title={t({
        id: 'guide.hunter.survival.sections.hero.title',
        message: 'Hero Talents',
      })}
    >
      <Trans id="guide.hunter.survival.sections.hero.section">
        <strong>Hero Talents</strong> - This section covers usage of hero talent abilities and
        mechanics.
      </Trans>
      {modules.moonlightChakram.guideSubsection}
    </Section>
  );
}
