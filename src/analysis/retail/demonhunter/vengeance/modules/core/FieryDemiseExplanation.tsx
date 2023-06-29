import { SpellLink } from 'interface';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';

import DownInFlamesExplanation from './DownInFlamesExplanation';
import { useInfo } from 'interface/guide';

interface Props {
  includeDownInFlames?: boolean;
  lineBreak?: boolean;
}

const FieryDemiseExplanation = ({ includeDownInFlames, lineBreak }: Props) => {
  const info = useInfo();
  if (!info || !info.combatant.hasTalent(TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT)) {
    return null;
  }
  return (
    <>
      {lineBreak ? <br /> : ' '}
      <>
        Always use when <SpellLink spell={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} /> is applied to
        the target in order to maximise the damage dealt due to{' '}
        <SpellLink spell={TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT} />.
        <DownInFlamesExplanation includeDownInFlames={includeDownInFlames} />
      </>
    </>
  );
};

export default FieryDemiseExplanation;
