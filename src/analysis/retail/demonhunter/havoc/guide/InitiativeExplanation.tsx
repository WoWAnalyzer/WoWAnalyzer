import { SpellLink } from 'interface';

import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import { useInfo } from 'interface/guide';

const InitiativeExplanation = () => {
  const info = useInfo();
  if (!info || !info.combatant.hasTalent(TALENTS_DEMON_HUNTER.INITIATIVE_TALENT)) {
    return null;
  }
  return (
    <p>
      <>
        Always use after casting <SpellLink spell={TALENTS_DEMON_HUNTER.VENGEFUL_RETREAT_TALENT} />{' '}
        so that you benefit from the increased critical strike chance provided by{' '}
        <SpellLink spell={TALENTS_DEMON_HUNTER.INITIATIVE_TALENT} />.
      </>
    </p>
  );
};

export default InitiativeExplanation;
