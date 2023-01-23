import { useInfo } from 'interface/guide';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import { Trans } from '@lingui/macro';
import { SpellLink } from 'interface';

interface Props {
  lineBreak?: boolean;
}
const NoDemonicExplanation = ({ lineBreak }: Props) => {
  const info = useInfo();
  if (!info || info.combatant.hasTalent(TALENTS_DEMON_HUNTER.DEMONIC_TALENT)) {
    return null;
  }
  return (
    <>
      {lineBreak ? <br /> : ' '}
      <Trans id="guide.demonhunter.havoc.noDemonic.explanation">
        Using this ability without also having{' '}
        <SpellLink id={TALENTS_DEMON_HUNTER.DEMONIC_TALENT} /> talented will lead to significantly
        less damage.
      </Trans>
    </>
  );
};

export default NoDemonicExplanation;
