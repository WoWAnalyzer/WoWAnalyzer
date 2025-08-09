import { Section } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { FoundationCooldownSection } from 'interface/guide/foundation/FoundationCooldownSection';
import { FoundationDowntimeSection } from 'interface/guide/foundation/FoundationDowntimeSection';
import { useExpansionContext } from 'interface/report/ExpansionContext';
import { AplSectionData } from 'interface/guide/components/Apl';
import { check, apl } from './modules/features/AplCheck';
import Para from 'interface/guide/Para';
import ResourceLink from 'interface/ResourceLink';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellLink from 'interface/SpellLink';
import spells from './spell-list_Monk_Brewmaster.classic';
import AlertWarning from 'interface/AlertWarning';

export default function Guide(): JSX.Element {
  const { expansion } = useExpansionContext();
  return (
    <>
      <Section title="Core Skills">
        <FoundationDowntimeSection />
        <FoundationCooldownSection />
      </Section>
      <Section title="Rotation">
        <Para>
          The Brewmaster rotation in Mists of Pandaria revolves around generating{' '}
          <ResourceLink id={RESOURCE_TYPES.CHI.id} /> efficiently with{' '}
          <SpellLink spell={spells.KEG_SMASH} /> and <SpellLink spell={spells.EXPEL_HARM} />, then
          spending it on <SpellLink spell={spells.BLACKOUT_KICK} />. Defensive abilities like{' '}
          <SpellLink spell={spells.ELUSIVE_BREW} /> are not included in this analysis, but you
          should still use them!
        </Para>
        <AlertWarning>
          In Mists of Pandaria, tank damage is heavily dependent on{' '}
          <SpellLink spell={spells.VENGEANCE_PASSIVE} />! It is so powerful that it is possible to
          execute your rotation perfectly and still do worse damage than someone with better{' '}
          <SpellLink spell={spells.VENGEANCE_PASSIVE} />. The best players will have good{' '}
          <SpellLink spell={spells.VENGEANCE_PASSIVE} /> and a good rotation.
        </AlertWarning>
        <AplSectionData checker={check} apl={apl} />
      </Section>
      <PreparationSection expansion={expansion} />
    </>
  );
}
