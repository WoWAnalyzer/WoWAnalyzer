import talents from 'common/TALENTS/monk';
import { Section, SubSection, useInfo } from 'interface/guide';
import Explanation from 'interface/guide/components/Explanation';
import { GapHighlight } from 'parser/ui/CooldownBar';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
export { MajorDefensive } from './core';
export { FortifyingBrew } from './FortifyingBrew';
export { ZenMeditation } from './ZenMeditation';
export { DiffuseMagic } from './DiffuseMagic';

const MAJOR_DEFENSIVES = [
  talents.CELESTIAL_BREW_TALENT,
  talents.FORTIFYING_BREW_TALENT,
  talents.DAMPEN_HARM_TALENT,
  talents.DIFFUSE_MAGIC_TALENT,
  talents.ZEN_MEDITATION_TALENT,
];

export default function MajorDefensivesSection(): JSX.Element | null {
  const info = useInfo();

  if (!info) {
    return null;
  }

  return (
    <Section title="Major Defensives">
      <Explanation>
        In Dragonflight, Brewmaster Monk has gained multiple major defensive cooldowns. Using these
        effectively is critical for your survival, especially while undergeared.
      </Explanation>
      <SubSection>
        {MAJOR_DEFENSIVES.map(
          (talent) =>
            info.combatant.hasTalent(talent) && (
              <CastEfficiencyBar
                spellId={talent.id}
                gapHighlightMode={GapHighlight.FullCooldown}
                useThresholds
                key={talent.id}
              />
            ),
        )}
      </SubSection>
    </Section>
  );
}
