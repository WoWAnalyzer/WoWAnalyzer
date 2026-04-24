import { Section, useInfo } from 'interface/guide';
import { AplSectionData } from 'interface/guide/components/Apl';
import * as AplCheck from '../../../core/AplCheck';

export default function RotationSection() {
  const info = useInfo();
  if (!info) {
    return null;
  }

  return (
    <Section title="Rotation">
      <p>
        Rotation priority based on your combat log. Does not account for movement or intentional
        cooldown holds.
      </p>
      <AplSectionData checker={AplCheck.check} apl={AplCheck.apl(info)} />
    </Section>
  );
}
