import type { JSX } from 'react';
import { useExpansionContext } from 'interface/report/ExpansionContext';
import { FoundationDowntimeSection } from 'interface/guide/foundation/FoundationDowntimeSection';
import { FoundationCooldownSection } from 'interface/guide/foundation/FoundationCooldownSection';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { Section, SubSection, useAnalyzer, useInfo } from 'interface/guide/index';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/classic/deathknight';
import { SpellLink } from 'interface';
import { CooldownBar, GapHighlight } from 'parser/ui/CooldownBar';
import SoulReaperEfficiency from './modules/features/SoulReaperEfficiency';
import RuneTracker from './modules/features/RuneTracker';

function SoulReaperSection(): JSX.Element | null {
  const info = useInfo();
  const sr = useAnalyzer(SoulReaperEfficiency);
  if (!info || !sr || !sr.hadExecutePhase) return null;

  const windows = sr.absoluteExecuteWindows;
  const threshold = Math.round(sr.executeThreshold * 100);
  const t15 = sr.hasT15_4p;

  return (
    <SubSection title="Soul Reaper (Execute)">
      <p>
        Cast <SpellLink spell={SPELLS.SOUL_REAPER_FROST} /> every 6 seconds once the boss is below{' '}
        {threshold}% HP{t15 ? ' (T15 4pc)' : ''}. Red segments show windows inside execute where you
        could have fit another cast.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <strong style={{ whiteSpace: 'nowrap' }}>
          {formatPercentage(sr.castEfficiency, 0)}% effic
        </strong>
        <small>
          ({sr.castsInExecute} / {sr.effectivePossibleCasts} casts
          {sr.excusedMisses() > 0 && `, ${sr.excusedMisses()} excused AoE`})
        </small>
      </div>
      <CooldownBar
        spellId={SPELLS.SOUL_REAPER_FROST.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        activeWindows={windows}
        minimizeIcons
        slimLines
      />
    </SubSection>
  );
}

function ResourceUseSection(): JSX.Element | null {
  const runeTracker = useAnalyzer(RuneTracker);
  if (!runeTracker) return null;

  return (
    <Section title="Resource Use">
      <SubSection title="Runes &amp; Runic Power">
        <p>
          Runes are Death Knight's primary resource. Spending them builds{' '}
          <SpellLink spell={SPELLS.FROST_STRIKE} /> charges via Runic Power. Avoid sitting capped on
          any rune type (2/2 available) — capped runes are wasted regeneration. Gold bars in the
          cast timeline are <SpellLink spell={SPELLS.FROST_STRIKE} /> (RP spend).
        </p>
        {runeTracker.plot}
      </SubSection>
    </Section>
  );
}

export default function FrostDKGuide(): JSX.Element {
  const { expansion } = useExpansionContext();
  return (
    <>
      <Section title="Core Skills">
        <FoundationDowntimeSection />
        <FoundationCooldownSection />
        <SoulReaperSection />
      </Section>
      <ResourceUseSection />
      <PreparationSection expansion={expansion} />
    </>
  );
}
