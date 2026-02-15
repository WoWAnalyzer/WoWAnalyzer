import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { GuideProps, Section } from 'interface/guide';
import TALENTS from 'common/TALENTS/hunter';
import CombatLogParser from 'analysis/retail/hunter/survival/CombatLogParser';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
export default function HeroSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section
      title={t({
        id: 'guide.hunter.survival.sections.hero.title',
        message: 'Hero Talents',
      })}
    >
      <Trans id="guide.hunter.survival.sections.hero.section">
        <strong>Hero Talents</strong>
      </Trans>
      {info.combatant.hasTalent(TALENTS.SENTINEL_TALENT) ? (
        <>
          <p>
            Sentinel: It is important for Survival Hunters to ensure proper management of Sentinel's
            Mark in order to maximise damage. Each time you consume{' '}
            <SpellLink spell={SPELLS.TIP_OF_THE_SPEAR_CAST} /> you have a chance to mark a target
            you're in combat with. It is important to always have a charge of bomb ready to consume
            the mark so that you do not waste applications.
          </p>
          {modules.sentinelsMark.guideSubsection}
          {modules.moonlightChakram.guideSubsection}
        </>
      ) : (
        <>
          <p>
            Pack Leader: The core loop of pack leader revolves around{' '}
            <SpellLink spell={SPELLS.HOWL_OF_THE_PACKLEADER_BUFF} /> and cycling the beasts as
            rapidly as possible. It is important that you do not waste the charge from{' '}
            <SpellLink spell={SPELLS.HOWL_OF_THE_PACKLEADER_BOAR} /> as it is a significant amount
            of damage. Positioning for both the boar spawn, and{' '}
            <SpellLink spell={SPELLS.STAMPEDE_READY_BUFF} /> is key to maximizing your damage output
            to ensure the boar and the stampede do not miss on the vertical axis.
          </p>
          {modules.stampedeAnalyzer.guideSubsection}
          {modules.howlBoar.guideSubsection}
        </>
      )}
    </Section>
  );
}
