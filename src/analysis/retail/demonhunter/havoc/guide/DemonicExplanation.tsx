import { useInfo } from 'interface/guide';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import SPELLS from 'common/SPELLS/demonhunter';
import { Trans } from '@lingui/macro';
import { SpellLink } from 'interface';

const DemonicExplanation = () => {
  const info = useInfo();
  if (!info || !info.combatant.hasTalent(TALENTS_DEMON_HUNTER.DEMONIC_TALENT)) {
    return null;
  }
  return (
    <p>
      <Trans id="guide.demonhunter.havoc.demonic.explanation">
        Always use after casting <SpellLink spell={TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT} /> so that
        you can benefit from the <SpellLink spell={SPELLS.METAMORPHOSIS_HAVOC} /> provided by{' '}
        <SpellLink spell={TALENTS_DEMON_HUNTER.DEMONIC_TALENT} />.
      </Trans>
    </p>
  );
};

export default DemonicExplanation;
