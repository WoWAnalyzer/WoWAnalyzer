import { ReactNode } from 'react';
import SpellUsageSubSection from 'parser/core/SpellUsage/SpellUsageSubSection';
import SPELLS from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';
import DemonicHealthstone from './spells/DemonicHealthstone';
import { TALENTS_WARLOCK } from 'common/TALENTS';

interface DHSGuideProps {
  analyzer: DemonicHealthstone;
  fightStart: number;
  fightEnd: number;
}

export function DemonicHealthstoneGuide({
  analyzer,
  fightStart,
  fightEnd,
}: DHSGuideProps): ReactNode {
  if (!analyzer) return null;

  // Get actual + potential missed uses
  const allUses = analyzer.getSpellUsesWithPotentialMisses(fightStart, fightEnd);

  return (
    <SpellUsageSubSection
      explanation={
        <>
          <SpellLink spell={SPELLS.DEMONIC_HEALTHSTONE} /> can be used to heal yourself in
          emergencies. Missed opportunities while alive are shown as potential uses (yellow boxes).
          Dead periods are ignored.
          <div style={{ marginTop: 8 }}>
            <strong>
              Always use with <SpellLink spell={TALENTS_WARLOCK.SOULBURN_TALENT} />.
            </strong>{' '}
            Example macro:
            <div
              style={{
                fontFamily: 'monospace',
                backgroundColor: '#383636',
                padding: 6,
                borderRadius: 4,
                marginTop: 4,
              }}
            >
              #showtooltip Demonic Healthstone
              <div>/cast Soulburn</div>
              <div>/use Demonic Healthstone</div>
            </div>
          </div>
        </>
      }
      uses={allUses}
      castBreakdownSmallText={
        <>- Yellow boxes indicate potential uses that were available but unused.</>
      }
    />
  );
}
