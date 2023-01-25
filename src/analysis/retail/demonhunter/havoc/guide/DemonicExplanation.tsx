import { useInfo } from 'interface/guide';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import SPELLS from 'common/SPELLS/demonhunter';
import { Trans } from '@lingui/macro';
import { SpellLink } from 'interface';

interface Props {
  lineBreak?: boolean;
}
const DemonicExplanation = ({ lineBreak }: Props) => {
  const info = useInfo();
  if (!info || !info.combatant.hasTalent(TALENTS_DEMON_HUNTER.DEMONIC_TALENT)) {
    return null;
  }
  return (
    <>
      {lineBreak ? <br /> : ' '}
      <Trans id="guide.demonhunter.havoc.demonic.explanation">
        Always use after casting <SpellLink id={TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT} /> so that you
        can benefit from the <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC} /> provided by{' '}
        <SpellLink id={TALENTS_DEMON_HUNTER.DEMONIC_TALENT} />.
      </Trans>
    </>
  );
};

export default DemonicExplanation;
