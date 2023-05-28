import { useInfo } from 'interface/guide';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import { Trans } from '@lingui/macro';
import { SpellLink } from 'interface';

const NoDemonicExplanation = () => {
  const info = useInfo();
  if (!info || info.combatant.hasTalent(TALENTS_DEMON_HUNTER.DEMONIC_TALENT)) {
    return null;
  }
  return (
    <p>
      <Trans id="guide.demonhunter.havoc.noDemonic.explanation">
        Using this ability without also having{' '}
        <SpellLink spell={TALENTS_DEMON_HUNTER.DEMONIC_TALENT} /> talented will lead to
        significantly less damage.
      </Trans>
    </p>
  );
};

export default NoDemonicExplanation;
