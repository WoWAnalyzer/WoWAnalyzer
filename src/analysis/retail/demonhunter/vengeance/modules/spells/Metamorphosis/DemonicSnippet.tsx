import { useInfo } from 'interface/guide';
import TALENTS from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import { Trans } from '@lingui/macro';

const DemonicSnippet = () => {
  const info = useInfo();
  if (!info || !info.combatant.hasTalent(TALENTS.DEMONIC_TALENT)) {
    return null;
  }
  return (
    <p>
      <Trans id="guide.demonhunter.vengeance.sections.defensives.metamorphosis.explanation.demonic">
        Metamorphosis is also granted by <SpellLink spell={TALENTS.DEMONIC_TALENT} /> when you press{' '}
        <SpellLink spell={TALENTS.FEL_DEVASTATION_TALENT} />.
      </Trans>
    </p>
  );
};

export default DemonicSnippet;
