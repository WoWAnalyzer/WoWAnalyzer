import { useInfo } from 'interface/guide';
import TALENTS from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';

const DemonicSnippet = () => {
  const info = useInfo();
  if (!info || !info.combatant.hasTalent(TALENTS.DEMONIC_TALENT)) {
    return null;
  }
  return (
    <p>
      <>
        Metamorphosis is also granted by <SpellLink spell={TALENTS.DEMONIC_TALENT} /> when you press{' '}
        <SpellLink spell={TALENTS.FEL_DEVASTATION_TALENT} />.
      </>
    </p>
  );
};

export default DemonicSnippet;
