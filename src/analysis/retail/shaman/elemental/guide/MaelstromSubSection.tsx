import { TALENTS_SHAMAN } from 'common/TALENTS/shaman';
import { GuideProps } from 'interface/guide';
import CombatLogParser from '../CombatLogParser';
import { GUIDE_EXPLANATION_PERCENT_WIDTH } from '../constants';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import BoringResourceValue from 'parser/ui/BoringResourceValue';
import SpellLink from 'interface/SpellLink';

/** A guide subsection for tracking Maelstrom usage. */
export const MaelstromSubSection = ({ modules }: GuideProps<typeof CombatLogParser>) => {
  const explanation = (
    <>
      <p>
        Maelstrom is the primary resource of elemental shamans. It empowers our most powerful
        spells: <SpellLink spell={TALENTS_SHAMAN.EARTH_SHOCK_TALENT} />,
        <SpellLink spell={TALENTS_SHAMAN.EARTHQUAKE_1_ELEMENTAL_TALENT} /> and{' '}
        <SpellLink spell={TALENTS_SHAMAN.ELEMENTAL_BLAST_ELEMENTAL_TALENT} />. These spells are
        almost always more powerful than the alternatives so you will want to cast them as much as
        possible.
      </p>
      <p>
        Maelstrom has a cap of 100 (or 150 with{' '}
        <SpellLink spell={TALENTS_SHAMAN.SWELLING_MAELSTROM_TALENT} />
        ). Any maelstrom generated past that cap is wasted and will not contribute to your damage.
      </p>
    </>
  );

  const data = (
    <BoringResourceValue
      resource={{ id: 11 }}
      label="Wasted Maelstrom"
      value={modules.maelstromDetails.wasted}
    />
  );

  return (
    <ExplanationAndDataSubSection
      title="Maelstrom"
      explanation={explanation}
      data={data}
      explanationPercent={GUIDE_EXPLANATION_PERCENT_WIDTH}
    />
  );
};
