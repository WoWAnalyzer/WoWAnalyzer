import type { ReactNode } from 'react';
import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';
import { SpellSequence, type CastInSequence } from 'interface/guide/components/CastSequence';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ConditionDescription } from 'parser/shared/metrics/apl/annotate';
import type { AplProcWindow } from './aplProcWindows';

interface WindowClassification {
  performance: QualitativePerformance;
  summary: string;
}

function LegendSwatch({ backgroundColor }: { backgroundColor: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '18px',
        height: '10px',
        borderRadius: '3px',
        background: backgroundColor,
        marginRight: '8px',
        verticalAlign: 'middle',
      }}
    />
  );
}

interface BuildAplProcWindowDataOptions {
  windows: AplProcWindow[];
  actionSpell: Spell;
  actionSpellIds?: number[];
  formatTimestamp: (timestamp: number) => string;
  classifyWindow: (window: AplProcWindow) => WindowClassification;
  sequenceTitle?: string;
  sequenceSubtext?: ReactNode;
}

export function buildAplProcWindowData({
  windows,
  actionSpell,
  actionSpellIds = [actionSpell.id],
  formatTimestamp,
  classifyWindow,
  sequenceTitle = 'Spell Sequence',
  sequenceSubtext,
}: BuildAplProcWindowDataOptions): PerCastData[] {
  return windows.map((window) => {
    const classification = classifyWindow(window);

    const annotatedSequence = window.sequence.map((cast) => {
      const topBeforeId = cast.aplExpectedBefore[0]?.id;
      const isCorrectTopCast = topBeforeId !== undefined && cast.spellId === topBeforeId;
      const isCastInsteadOfAction =
        topBeforeId === actionSpell.id && !actionSpellIds.includes(cast.spellId);

      const tooltip = (
        <>
          <strong>{cast.spellName}</strong>
          <div>@ {formatTimestamp(cast.timestamp)}</div>
          <div style={{ marginTop: '6px' }}>
            Before:{' '}
            {cast.aplExpectedBefore.length > 0
              ? cast.aplExpectedBefore.map((spell) => spell.name).join(' -> ')
              : 'None'}
          </div>
          <div>
            After:{' '}
            {cast.aplExpectedAfter.length > 0
              ? cast.aplExpectedAfter.map((spell) => spell.name).join(' -> ')
              : 'None'}
          </div>
        </>
      );

      if (!isCorrectTopCast && !isCastInsteadOfAction) {
        return { ...cast, tooltip };
      }

      return {
        ...cast,
        outlineColor: isCorrectTopCast ? '#2ecc71' : '#fab700',
        tooltip: (
          <>
            {tooltip}
            <div
              style={{
                marginTop: '6px',
                color: isCorrectTopCast ? '#2ecc71' : '#fab700',
              }}
            >
              {isCorrectTopCast
                ? 'This cast matched the top APL recommendation at that moment.'
                : `${actionSpell.name} was already the top APL recommendation at that moment.`}
            </div>
          </>
        ),
      };
    });

    const sequence: CastInSequence[] = [];
    let insertedExpectedActionSpell = false;

    annotatedSequence.forEach((cast) => {
      const actionSpellBecomesExpected =
        !insertedExpectedActionSpell &&
        cast.aplExpectedBefore[0]?.id === actionSpell.id &&
        !actionSpellIds.includes(cast.spellId);

      if (actionSpellBecomesExpected) {
        sequence.push({
          timestamp: cast.timestamp,
          spellId: actionSpell.id,
          spellName: `${actionSpell.name} was expected here`,
          icon: actionSpell.icon,
          ghosted: true,
          tooltip: (
            <>
              <strong>{actionSpell.name}</strong>
              <div>
                This is the first cast where the APL expected {actionSpell.name} to be pressed.
              </div>
            </>
          ),
        });
        insertedExpectedActionSpell = true;
      }

      const isEarlyActionSpend =
        actionSpellIds.includes(cast.spellId) &&
        window.spentCastAt === cast.timestamp &&
        !window.spentWhenReady &&
        window.higherPriorityAtSpend.length > 0;

      if (isEarlyActionSpend) {
        window.higherPriorityAtSpend.forEach((spell) => {
          sequence.push({
            timestamp: cast.timestamp,
            spellId: spell.id,
            spellName: `${spell.name} was higher priority`,
            icon: spell.icon,
            ghosted: true,
            tooltip: (
              <>
                <strong>{spell.name}</strong>
                <div>This was still higher priority than {actionSpell.name} at this moment.</div>
                {window.higherPriorityRule && (
                  <div style={{ marginTop: '6px' }}>
                    This was higher priority
                    <ConditionDescription rule={window.higherPriorityRule} prefix="because" />.
                  </div>
                )}
              </>
            ),
          });
        });
      }

      sequence.push(cast);

      if (actionSpellIds.includes(cast.spellId)) {
        insertedExpectedActionSpell = true;
      }
    });

    return {
      performance: classification.performance,
      timestamp: formatTimestamp(window.start),
      detailsIcon: null,
      stats: [],
      additionalContent: {
        title: sequenceTitle,
        content: (
          <div style={{ display: 'grid', gap: '0.9rem' }}>
            {sequenceSubtext && (
              <div style={{ color: 'rgba(255,255,255,0.58)', marginTop: '-0.2rem' }}>
                {sequenceSubtext}
              </div>
            )}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(0,0,0,0.16)',
              }}
            >
              {sequence.length > 0 ? (
                <SpellSequence casts={sequence} iconSize={34} />
              ) : (
                <div>No casts recorded during this window.</div>
              )}
            </div>
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(0,0,0,0.16)',
                display: 'grid',
                gap: '0.6rem',
              }}
            >
              <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>Legend</div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <div>
                  <LegendSwatch backgroundColor="#2ecc71" /> the cast matched the top APL
                  recommendation at that moment.
                </div>
                <div>
                  <LegendSwatch backgroundColor="#fab700" /> a cast was made while{' '}
                  <SpellLink spell={actionSpell} /> was already the top APL recommendation.
                </div>
                <div>
                  <LegendSwatch backgroundColor="rgba(220,220,220,0.75)" /> an APL guidance marker
                  showing either where <SpellLink spell={actionSpell} /> was first expected or which
                  ability still ranked above it at the actual spend.
                </div>
              </div>
            </div>
          </div>
        ),
      },
      details: null,
    };
  });
}

interface AplProcWindowDetailProps extends Omit<BuildAplProcWindowDataOptions, 'windows'> {
  title: string;
  windows: AplProcWindow[];
}

export default function AplProcWindowDetail({
  title,
  windows,
  ...options
}: AplProcWindowDetailProps) {
  return (
    <CastDetail
      title={title}
      description=""
      casts={buildAplProcWindowData({ windows, ...options })}
    />
  );
}
