import Spell from 'common/SPELLS/Spell';
import {
  AvailableColor,
  BadColor,
  OkColor,
  SubSection,
  useAnalyzer,
  useInfo,
} from 'interface/guide';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { CooldownWindow, GapHighlight } from 'parser/ui/CooldownBar';
import { Highlight } from 'interface/Highlight';

import SPELLS from 'common/SPELLS/classic/warlock';

type SpellCooldown = {
  spell: Spell;
  activeWindows?: CooldownWindow[];
};

const cooldowns: SpellCooldown[] = [
  { spell: SPELLS.DEMONIC_EMPOWERMENT },
  { spell: SPELLS.METAMORPHOSIS },
];

const CooldownGraphSubsection = () => {
  const info = useInfo();
  const castEfficiency = useAnalyzer(CastEfficiency);
  if (!info || !castEfficiency) {
    return null;
  }

  return (
    <SubSection>
      <>
        <strong>Cooldown Graph</strong>
        <div>
          <small>
            <Highlight color={AvailableColor} textColor="black">
              Grey
            </Highlight>{' '}
            segments show when the spell was available to cast.{' '}
            <Highlight color={OkColor} textColor="black">
              Yellow
            </Highlight>{' '}
            segments show when the spell was cooling down.{' '}
            <Highlight color={BadColor} textColor="black">
              Red
            </Highlight>{' '}
            segments show when you could have used a whole extra cooldown.
          </small>
        </div>
      </>
      {cooldowns.map((cooldownCheck) => (
        <CastEfficiencyBar
          key={cooldownCheck.spell.id}
          spellId={cooldownCheck.spell.id}
          gapHighlightMode={GapHighlight.FullCooldown}
        />
      ))}
    </SubSection>
  );
};

export default CooldownGraphSubsection;
