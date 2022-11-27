import { SpellLink } from 'interface';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import Combatant from 'parser/core/Combatant';

interface Props {
  combatant: Combatant;
  includeDownInFlames?: boolean;
}

const FieryDemiseExplanation = ({ combatant, includeDownInFlames }: Props) => (
  <>
    {' '}
    Always use when <SpellLink id={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} /> is applied to the
    target in order to maximise the damage dealt due to{' '}
    <SpellLink id={TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT} />.
    {includeDownInFlames && combatant.hasTalent(TALENTS_DEMON_HUNTER.DOWN_IN_FLAMES_TALENT) && (
      <>
        {' '}
        Always cast one of your charges of{' '}
        <SpellLink id={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} /> before casting this ability so
        that you can benefit from <SpellLink id={TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT} />.
      </>
    )}
  </>
);

export default FieryDemiseExplanation;
