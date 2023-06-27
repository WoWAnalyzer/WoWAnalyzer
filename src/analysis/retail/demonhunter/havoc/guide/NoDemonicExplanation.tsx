import { useInfo } from 'interface/guide';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';

import { SpellLink } from 'interface';

const NoDemonicExplanation = () => {
  const info = useInfo();
  if (!info || info.combatant.hasTalent(TALENTS_DEMON_HUNTER.DEMONIC_TALENT)) {
    return null;
  }
  return (
    <p>
      <>
        Using this ability without also having{' '}
        <SpellLink spell={TALENTS_DEMON_HUNTER.DEMONIC_TALENT} /> talented will lead to
        significantly less damage.
      </>
    </p>
  );
};

export default NoDemonicExplanation;
