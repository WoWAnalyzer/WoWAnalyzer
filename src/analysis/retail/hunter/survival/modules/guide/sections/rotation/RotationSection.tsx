import { t, Trans } from '@lingui/macro';
import { GuideProps, Section, SubSection } from 'interface/guide';
import CombatLogParser from 'analysis/retail/hunter/survival/CombatLogParser';
import TALENTS from 'common/TALENTS/hunter';
//Commented out because they will be reactived relatively quick.
import * as AplCheck from 'analysis/retail/hunter/survival/modules/apl/AplCheck';
import { AplSectionData } from 'interface/guide/components/Apl';
import SpellLink from 'interface/SpellLink';
export default function RotationSection({
  modules,
  events,
  info,
}: GuideProps<typeof CombatLogParser>) {
  return (
    <Section
      title={t({
        id: 'guide.hunter.survival.sections.rotation.title',
        message: 'Rotation',
      })}
    >
      <SubSection
        title={t({
          id: 'guide.hunter.survival.sections.rotation.core.title',
          message: 'Core Rotation',
        })}
      >
        {modules.raptorStrike.guideSubsection}
      </SubSection>

      <SubSection
        title={t({
          id: 'guide.hunter.survival.sections.rotation.rotationalcooldowns.title',
          message: 'Rotational Cooldowns',
        })}
      >
        <Trans id="guide.hunter.survival.sections.rotation.core.graph">
          <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how
          long you waited to use them again. Grey segments show when the spell was available, yellow
          segments show when the spell was cooling down. Red segments highlight times when you could
          have fit a whole extra use of the cooldown.
        </Trans>
        {modules.wildfireBomb.guideSubsection}
        {info.combatant.hasTalent(TALENTS.FLANKING_STRIKE_TALENT) &&
          modules.flankingStrike.guideSubsection}
        {info.combatant.hasTalent(TALENTS.FLANKING_STRIKE_TALENT) &&
          modules.butchery.guideSubsection}
        {modules.explosiveShot.guideSubsectionSV}
        {modules.killShot.guideSubsectionSV}
        {info.combatant.hasTalent(TALENTS.FURY_OF_THE_EAGLE_TALENT) &&
          modules.furyOfTheEagle.guideSubsection}
      </SubSection>
      <SubSection title="APL Analysis">
        <AplSectionData checker={AplCheck.checkApl} apl={AplCheck.apl} />
        <hr />
        <p>
          This list does not include <SpellLink spell={TALENTS.SPEARHEAD_TALENT} />
          , <SpellLink spell={TALENTS.COORDINATED_ASSAULT_TALENT} />,{' '}
          <SpellLink spell={TALENTS.FURY_OF_THE_EAGLE_TALENT} />. Cooldowns may often be held for
          fight mechanics, and appear as common problems which interfere with rotation analysis. eg.
          Fury of the Eagle is a high priority ability that is often held when adds are about to
          spawn and would create many instances of 'Higher priority ability was available.'
        </p>
        <div>
          This should be used as a reference point for improvement when comparing against other
          logs. It does not cover the full set of priorites used by Raidbots (much like the written
          guides) as the list would be far too long and too complex to follow.
          <br />
          <br />
          Potential areas of inaccuracy:
          <ul>
            <li>Holding cooldowns for raid events</li>
            <li>Multiple targets</li>
            <li>Movement or periods of downtime</li>
          </ul>
        </div>
      </SubSection>
    </Section>
  );
}
