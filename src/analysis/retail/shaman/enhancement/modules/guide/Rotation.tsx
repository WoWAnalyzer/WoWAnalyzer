import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from '../../CombatLogParser';
import { AplSectionData } from 'interface/guide/components/Apl';
import * as AplCheck from '../apl/AplCheck';

export default function Rotation({ modules, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Rotation / Action Priority List">
      <p></p>

      <p>
        This Action Priority List (APL) is based off the{' '}
        <a
          href="https://www.wowhead.com/guide/classes/shaman/enhancement/rotation-cooldowns-pve-dps"
          target="_blank"
          rel="noopener noreferrer"
        >
          Single Target
        </a>{' '}
        on Wowhead.
      </p>
      <AplSectionData checker={AplCheck.check} apl={AplCheck.apl(info)} />
    </Section>
  );
}
