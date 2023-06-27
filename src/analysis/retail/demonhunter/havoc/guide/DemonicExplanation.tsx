import { useInfo } from 'interface/guide';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import SPELLS from 'common/SPELLS/demonhunter';

import { SpellLink } from 'interface';

const DemonicExplanation = () => {
  const info = useInfo();
  if (!info || !info.combatant.hasTalent(TALENTS_DEMON_HUNTER.DEMONIC_TALENT)) {
    return null;
  }
  return (
    <p>
      <>
        Always use after casting <SpellLink spell={TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT} /> so that
        you can benefit from the <SpellLink spell={SPELLS.METAMORPHOSIS_HAVOC} /> provided by{' '}
        <SpellLink spell={TALENTS_DEMON_HUNTER.DEMONIC_TALENT} />.
      </>
    </p>
  );
};

export default DemonicExplanation;
