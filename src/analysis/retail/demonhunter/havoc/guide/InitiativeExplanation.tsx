import { SpellLink } from 'interface';
import { Trans } from '@lingui/macro';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import { useInfo } from 'interface/guide';

interface Props {
  lineBreak?: boolean;
}
const InitiativeExplanation = ({ lineBreak }: Props) => {
  const info = useInfo();
  if (!info || !info.combatant.hasTalent(TALENTS_DEMON_HUNTER.INITIATIVE_TALENT)) {
    return null;
  }
  return (
    <>
      {lineBreak ? <br /> : ' '}
      <Trans id="guide.demonhunter.havoc.initiative.explanation">
        Always use after casting <SpellLink id={TALENTS_DEMON_HUNTER.VENGEFUL_RETREAT_TALENT} /> so
        that you benefit from the increased critical strike chance provided by{' '}
        <SpellLink id={TALENTS_DEMON_HUNTER.INITIATIVE_TALENT} />.
      </Trans>
    </>
  );
};

export default InitiativeExplanation;
