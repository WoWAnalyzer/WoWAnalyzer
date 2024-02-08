import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from 'analysis/retail/paladin/retribution/CombatLogParser';
import ItemSetLink from 'interface/ItemSetLink';
import { PALADIN_T31_ID } from 'common/ITEMS/dragonflight';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS/paladin';
import TALENTS from 'common/TALENTS/paladin';

export const ZealousPyreknightsArdorGuideSection = ({
  modules,
}: GuideProps<typeof CombatLogParser>) => {
  const zealousPyreknightsArdor2p = modules.zealousPyreknightsArdor2p;
  const zealousPyreknightsArdor4p = modules.zealousPyreknightsArdor4p;

  console.log('priority', {
    zealousPyreknightsArdorEchoesOfWrathNormalizer:
      modules.zealousPyreknightsArdorEchoesOfWrathNormalizer.priority,
    zealousPyreknightsArdorEventLinkNormalizer:
      modules.zealousPyreknightsArdorEventLinkNormalizer.priority,
    zealousPyreknightsArdor2p: modules.zealousPyreknightsArdor2p.priority,
    zealousPyreknightsArdor4p: modules.zealousPyreknightsArdor4p.priority,
  });

  if (!zealousPyreknightsArdor2p.active) {
    return null;
  }

  return (
    <Section title="Zealous Pyreknight's Ardor">
      <p>
        <strong>
          <ItemSetLink id={PALADIN_T31_ID}>Zealous Pyreknight&apos;s Ardor</ItemSetLink>
        </strong>{' '}
        gives you large amounts of AoE damage and some additional priority damage due to{' '}
        <SpellLink spell={SPELLS.WRATHFUL_SANCTION} />, increased damage on{' '}
        <SpellLink spell={SPELLS.EXPURGATION} />, and echoed damage from{' '}
        <SpellLink spell={TALENTS.FINAL_VERDICT_TALENT} /> /{' '}
        <SpellLink spell={TALENTS.DIVINE_STORM_TALENT} />.
      </p>
      {zealousPyreknightsArdor2p.guideSubsection}
      {zealousPyreknightsArdor4p.active ? zealousPyreknightsArdor4p.guideSubsection : null}
    </Section>
  );
};
