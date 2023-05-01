import { SpellLink } from 'interface';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import { Trans } from '@lingui/macro';
import { useInfo } from 'interface/guide';

interface Props {
  includeDownInFlames?: boolean;
  lineBreak?: boolean;
}
const DownInFlamesExplanation = ({ includeDownInFlames, lineBreak }: Props) => {
  const info = useInfo();
  if (
    !info ||
    !info.combatant.hasTalent(TALENTS_DEMON_HUNTER.DOWN_IN_FLAMES_TALENT) ||
    !includeDownInFlames
  ) {
    return null;
  }
  return (
    <>
      {lineBreak ? <br /> : ' '}
      <Trans id="guide.demonhunter.vengeance.downInFlames.explanation">
        Always cast one of your charges of{' '}
        <SpellLink spell={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} /> before casting this ability so
        that you can benefit from <SpellLink spell={TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT} />.
      </Trans>
    </>
  );
};

export default DownInFlamesExplanation;
