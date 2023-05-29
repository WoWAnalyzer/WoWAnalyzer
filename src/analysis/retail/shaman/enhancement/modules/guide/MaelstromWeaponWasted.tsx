import { Trans } from '@lingui/macro';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { useInfo } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import PerformancePercentage from './PerformancePercentage';

interface Props {
  performance: QualitativePerformance;
  wasted: number;
  gained: number;
}

const MaelstromWeaponWasted = ({ performance, wasted, gained }: Props) => {
  const info = useInfo();
  if (!info) {
    return null;
  }
  return (
    <p>
      <Trans id="guide.shaman.enhancement.sections.resources.maelstromweapon.chart">
        The chart below shows your <SpellLink id={TALENTS_SHAMAN.MAELSTROM_WEAPON_TALENT} />
        over the source of the encounter. You wasted{' '}
        <PerformancePercentage performance={performance} gained={gained} wasted={wasted} /> of your{' '}
        <SpellLink id={TALENTS_SHAMAN.MAELSTROM_WEAPON_TALENT.id} />.
      </Trans>
    </p>
  );
};

export default MaelstromWeaponWasted;
