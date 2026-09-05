import { SpellLink } from 'interface';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import { useInfo } from 'interface/guide';

interface Props {
  lineBreak?: boolean;
}
const FinalBreathExplanation = ({ lineBreak }: Props) => {
  const info = useInfo();
  if (!info || !info.combatant.hasTalent(TALENTS_DEMON_HUNTER.FINAL_BREATH_TALENT)) {
    return null;
  }
  return (
    <>
      <p>
        If fully channeled, the final tick will deal additional damage due to{' '}
        <SpellLink spell={TALENTS_DEMON_HUNTER.FINAL_BREATH_TALENT} />.
      </p>
    </>
  );
};

export default FinalBreathExplanation;
