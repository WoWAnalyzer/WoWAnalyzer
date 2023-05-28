import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS/demonhunter';
import { Trans } from '@lingui/macro';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import { useInfo } from 'interface/guide';

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
      <Trans id="guide.demonhunter.vengeance.demonic.explanation">
        It will grant <SpellLink spell={SPELLS.METAMORPHOSIS_TANK} /> for a short duration when cast
        due to <SpellLink spell={TALENTS_DEMON_HUNTER.DEMONIC_TALENT} />.
      </Trans>
    </>
  );
};

export default DemonicExplanation;
