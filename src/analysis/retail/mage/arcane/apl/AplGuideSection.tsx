import { SubSection } from 'interface/guide';
import { AplSectionData } from 'interface/guide/components/Apl';
import { Info } from 'parser/core/metric';

import TALENTS from 'common/TALENTS/mage';

import * as sfApl from 'src/analysis/retail/mage/arcane/apl/SunfuryAplCheck';

export default function AplGuideSubsection({ info }: { info: Info }) {
  return (
    <SubSection title="Action Priority List (APL)">
      {info.combatant.hasTalent(TALENTS.MEMORY_OF_ALAR_TALENT) && (
        <AplSectionData checker={sfApl.sunfuryCheck} apl={sfApl.sunfuryApl} />
      )}
    </SubSection>
  );
}
