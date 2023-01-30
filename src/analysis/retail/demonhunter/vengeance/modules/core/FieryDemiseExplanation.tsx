import { SpellLink } from 'interface';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import { Trans } from '@lingui/macro';

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
      <Trans id="guide.demonhunter.vengeance.fieryDemise.explanation">
        Always use when <SpellLink id={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} /> is applied to the
        target in order to maximise the damage dealt due to{' '}
        <SpellLink id={TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT} />.
        <DownInFlamesExplanation includeDownInFlames={includeDownInFlames} />
      </Trans>
    </>
  );
};

export default FieryDemiseExplanation;
