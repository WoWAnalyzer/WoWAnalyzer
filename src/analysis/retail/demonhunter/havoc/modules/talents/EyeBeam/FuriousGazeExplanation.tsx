import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS/demonhunter';

import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import { useInfo } from 'interface/guide';

interface Props {
  lineBreak?: boolean;
}
const DemonicExplanation = ({ lineBreak }: Props) => {
  const info = useInfo();
  if (!info || !info.combatant.hasTalent(TALENTS_DEMON_HUNTER.FURIOUS_GAZE_TALENT)) {
    return null;
  }
  return (
    <>
      {lineBreak ? <br /> : ' '}
      <>
        It will grant <SpellLink spell={SPELLS.FURIOUS_GAZE} /> for a short duration when cast due
        to <SpellLink spell={TALENTS_DEMON_HUNTER.FURIOUS_GAZE_TALENT} />.
      </>
    </>
  );
};

export default DemonicExplanation;
