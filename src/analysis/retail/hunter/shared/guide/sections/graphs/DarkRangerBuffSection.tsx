import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { GuideProps, Section, SubSection } from 'interface/guide';
import CombatLogParser from 'analysis/retail/hunter/beastmastery/CombatLogParser';
import TALENTS from 'common/TALENTS/hunter';
import SPELLS from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';

export default function DarkRangerGraphSection({
  modules,
  info,
}: GuideProps<typeof CombatLogParser>) {
  return (
    <Section
      title={t({
        id: 'guide.gunter.shared.sections.buffs.darkranger.title',
        message: 'Dark Ranger Buffs',
      })}
    >
      <SubSection
        title={t({
          id: 'guide.hunter.beastmastery.sections.buffs.darkranger.title',
          message: 'Bell Tolls and Blighted Quiver',
        })}
      >
        <p>
          <Trans id="guide.hunter.shared.sections.buffs.summary">
            This graph shows the number of stacks of{' '}
            <SpellLink spell={SPELLS.BLIGHTED_QUIVER_BUFF} /> and
            <SpellLink spell={SPELLS.BELL_TOLLS_BUFF} /> that you had. Blighted Quiver can have a
            substatial effect on the burst from Withering Fire, however we do not hold our{' '}
            <SpellLink spell={TALENTS.CALL_OF_THE_WILD_TALENT} /> for more stacks. It can be useful
            to see how many stacks of each you had for each withering fire in order to understand
            why one window may do more damage than another.
          </Trans>
        </p>
        {modules.darkRangerStacksGraph.plot}
      </SubSection>
    </Section>
  );
}
