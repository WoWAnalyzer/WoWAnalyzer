import CombatLogParser from 'parser/core/CombatLogParser';
import DebugAnnotations, {
  AnnotatedEvent,
  ModuleAnnotations,
} from 'parser/core/modules/DebugAnnotations';
import Tooltip from './Tooltip';
import { Ability, AnyEvent, HasAbility, HasSource, HasTarget } from 'parser/core/Events';
import { CSSProperties, useMemo, useState, useCallback } from 'react';
import { useCombatLogParser } from './report/CombatLogParserContext';
import { formatDuration } from 'common/format';
import SpellLink from './SpellLink';
import styles from './DebugAnnotationsTab.module.scss';

export default function DebugAnnotationsTab({ parser }: { parser: CombatLogParser }) {
  const annotations = parser.getModule(DebugAnnotations);
  return (
    <div className="panel">
      <div className="panel-heading">
        <h1>Debug Annotations</h1>
        <a href="/support-stats">View Aggregated Stats</a>
      </div>
      <div
        className="panel-body flex"
        style={{ padding: '1em 2em', flexDirection: 'column', gap: '1em' }}
      >
        {annotations.getAll().map((props) => (
          <ModuleDebugAnnotations key={props.module.constructor.name} {...props} />
        ))}
      </div>
    </div>
  );
}

function ModuleDebugAnnotations({ module, annotations }: ModuleAnnotations) {
  const { combatLogParser: parser } = useCombatLogParser();
  const [selected, setSelected] = useState<AnnotatedEvent | null>(null);
  return (
    <div>
      <h3>{module.key}</h3>
      <div>Recorded annotations for {annotations.length} events</div>
      <div className={styles.dotContainer}>
        {intoRows(annotations, parser.fight.start_time).map((row, index) => (
          <div key={index} className={styles.row}>
            <div className={styles.rowTimestamp}>
              {`${index}:00`} - {row.length} events
            </div>
            <div className={styles.rowContent}>
              {row.map((props, index) => (
                <AnnotationDot
                  key={index}
                  {...props}
                  onClick={() => setSelected((current) => (current === props ? null : props))}
                  selected={selected === props}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      {selected && <EventDetails {...selected} clearSelection={() => setSelected(null)} />}
    </div>
  );
}

function EventDetails({
  event,
  annotations,
  clearSelection,
}: AnnotatedEvent & { clearSelection: () => void }) {
  const { combatLogParser } = useCombatLogParser();
  return (
    <div>
      <hr />
      <div>
        <h4>
          Event Details
          <button
            className="btn btn-link"
            style={{ display: 'inline-block' }}
            onClick={clearSelection}
          >
            <small>(Clear Selection)</small>
          </button>
        </h4>{' '}
      </div>
      <div className={styles.eventDetailsColumns}>
        <div>
          <dl>
            <dt>Timestamp</dt>
            <dd>{formatDuration(event.timestamp - combatLogParser.fight.start_time)}</dd>
            <dt>Type</dt>
            <dd>{event.type}</dd>
            {HasAbility(event) && (
              <>
                <dt>Ability</dt>
                <dd>
                  <SpellLink spell={event.ability.guid} /> <CopySpellData ability={event.ability} />
                </dd>
              </>
            )}
            {HasSource(event) && (
              <>
                <dt>Source</dt>
                <dd>
                  {combatLogParser.getSourceName(event)} (ID: {event.sourceID})
                </dd>
              </>
            )}
            {HasTarget(event) && (
              <>
                <dt>Target</dt>
                <dd>
                  {combatLogParser.getTargetName(event)} (ID: {event.targetID})
                </dd>
              </>
            )}
          </dl>
          {annotations.map(({ summary, details }, index) => (
            <div key={index}>
              <hr />
              <h5>{summary}</h5>
              {details}
            </div>
          ))}
        </div>
        <pre className={styles.eventPre}>
          {JSON.stringify(
            event,
            function (k, v) {
              if (!k) {
                return v;
              }
              if (v && typeof v === 'object' && 'timestamp' in v) {
                // if we find another event-like object that isn't the top-level event, skip it
                return { '...': 'truncated' };
              }
              return v;
            },
            2,
          )}
        </pre>
      </div>
    </div>
  );
}

const AnnotationDot = ({
  event,
  annotations,
  onClick,
  selected,
}: AnnotatedEvent & { onClick: () => void; selected?: boolean }) => {
  const annotation = useMemo(() => {
    let result = annotations[0];
    for (const annotation of annotations.slice(1)) {
      if ((annotation.priority ?? 0) > (result.priority ?? 0)) {
        result = annotation;
      }
    }
    return result;
  }, [annotations]);

  const { combatLogParser } = useCombatLogParser();

  return (
    <Tooltip
      content={`${formatDuration(event.timestamp - combatLogParser.fight.start_time)} - ${annotation.summary}`}
    >
      <div
        className={[styles.dot, selected && styles.dotSelected].filter(Boolean).join(' ')}
        style={{ '--annotation-dot-color': annotation.color } as CSSProperties}
        onClick={onClick}
      />
    </Tooltip>
  );
};

function intoRows<T extends { event: AnyEvent }>(data: T[], startTime: number): T[][] {
  const rows: T[][] = [[]];
  let currentIndex = 0;
  for (const datum of data) {
    const index = Math.floor((datum.event.timestamp - startTime) / 60000);
    if (currentIndex !== index) {
      currentIndex = index;
      rows.push([]);
    }
    rows.at(-1)?.push(datum);
  }

  return rows;
}

function CopySpellData({ ability }: { ability: Ability }) {
  const copy = useCallback(async () => {
    try {
      const data = JSON.stringify({
        id: ability.guid,
        name: ability.name,
        icon: ability.abilityIcon,
      });
      const key = ability.name
        .toUpperCase()
        .replaceAll(/\W+/g, '_')
        .replaceAll(/[^a-zA-Z_]/g, '');
      const text = `${key}: ${data},`;
      await navigator.clipboard.writeText(text);
    } catch {
      alert('Unable to copy data to clipboard');
    }
  }, [ability]);

  return (
    <button type="button" className={styles.copyTextLink} onClick={copy}>
      (copy definition)
    </button>
  );
}
