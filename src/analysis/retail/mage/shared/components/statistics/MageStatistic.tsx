import { ReactNode, type JSX } from 'react';
import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import { Talent } from 'common/TALENTS/types';
import Spell from 'common/SPELLS/Spell';
import Statistic, { StatisticSize } from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellIcon, SpellLink } from 'interface';
import MajorDefensive, {
  MitigationRow,
  MitigationRowContainer,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { useFight } from 'interface/report/context/FightContext';
import { EventType } from 'parser/core/Events';

interface MageStatisticProps {
  spell: Spell | Talent;
  category?: STATISTIC_CATEGORY;
  size?: StatisticSize;
  position?: number;
  tooltip?: ReactNode;
  dropdown?: ReactNode;
  title?: ReactNode;
  children: ReactNode;
}

/**
 * Displays a mage statistic card with spell icon and configurable content.
 * @param spell - The spell or talent to display
 * @param category - Statistic category for tab grouping
 * @param size - Size of the statistic card
 * @param position - Sort order position
 * @param tooltip - Tooltip content
 * @param dropdown - Expandable dropdown content
 * @param title - Custom title override
 * @param children - Card body content
 */
function MageStatistic({
  spell,
  category = STATISTIC_CATEGORY.GENERAL,
  size = 'flexible',
  position,
  tooltip,
  dropdown,
  title,
  children,
}: MageStatisticProps): JSX.Element {
  const defaultTitle = (
    <label>
      <SpellIcon spell={spell} /> <SpellLink spell={spell} icon={false} />
    </label>
  );

  return (
    <Statistic
      category={category}
      size={size}
      position={position}
      tooltip={tooltip}
      dropdown={dropdown}
    >
      <div className="pad boring-text">
        {title || defaultTitle}
        <div className="value">{children}</div>
      </div>
    </Statistic>
  );
}

interface ValueProps {
  value: number;
  label?: string;
  precision?: number;
  icon?: ReactNode;
}

/**
 * Displays a DPS value.
 */
MageStatistic.DPS = function DPS({ value, label = 'DPS', precision = 0, icon }: ValueProps) {
  return (
    <div>
      {icon && <>{icon} </>}
      {formatNumber(value)} <small>{label}</small>
    </div>
  );
};

/**
 * Displays a raw number value.
 */
MageStatistic.Number = function Number({ value, label, precision, icon }: ValueProps) {
  const formattedValue = precision !== undefined ? value.toFixed(precision) : formatNumber(value);
  return (
    <div>
      {icon && <>{icon} </>}
      {formattedValue} {label && <small>{label}</small>}
    </div>
  );
};

/**
 * Displays a percentage value.
 */
MageStatistic.Percentage = function Percentage({ value, label, precision = 2, icon }: ValueProps) {
  return (
    <div>
      {icon && <>{icon} </>}
      {formatPercentage(value, precision)}% <small>{label}</small>
    </div>
  );
};

/**
 * Displays a duration value.
 */
MageStatistic.Duration = function Duration({ value, label, icon }: Omit<ValueProps, 'precision'>) {
  return (
    <div>
      {icon && <>{icon} </>}
      {formatDuration(value)} {label && <small>{label}</small>}
    </div>
  );
};

/**
 * Displays damage done.
 */
MageStatistic.Damage = function Damage({ value, label = 'damage', precision = 0 }: ValueProps) {
  return (
    <div>
      <img alt="Damage" src="/img/sword.png" className="icon" /> {formatNumber(value)}{' '}
      <small>{label}</small>
    </div>
  );
};

/**
 * Displays healing done.
 */
MageStatistic.Healing = function Healing({ value, label = 'healing', precision = 0 }: ValueProps) {
  return (
    <div>
      <img alt="Healing" src="/img/healing.png" className="icon" /> {formatNumber(value)}{' '}
      <small>{label}</small>
    </div>
  );
};

/**
 * Displays defensive damage mitigated.
 */
MageStatistic.Defensive = function Defensive<Apply extends EventType, Remove extends EventType>({
  value,
  analyzer,
  label = 'Damage Mitigated',
  precision = 0,
}: (
  | ValueProps
  | { analyzer: MajorDefensive<Apply, Remove>; label?: string; precision?: number }
) & {
  value?: number;
  analyzer?: MajorDefensive<Apply, Remove>;
}) {
  const displayValue =
    value ??
    (analyzer?.mitigations
      .flatMap((mit) => mit.mitigated.map((event) => event.mitigatedAmount))
      .reduce((a, b) => a + b, 0) ||
      0);

  return (
    <div>
      <img alt="Damage Mitigated" src="/img/shield.png" className="icon" />{' '}
      {formatNumber(displayValue)} <small>{label}</small>
    </div>
  );
};

/**
 * Displays custom content.
 */
MageStatistic.Custom = function Custom({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
};

interface ColumnConfig<T = unknown> {
  header: ReactNode;
  getValue: (data: T) => ReactNode;
}

/**
 * Displays a data table in the statistic dropdown.
 */
MageStatistic.DropdownTable = function DropdownTable<T = unknown>({
  columns,
  data,
}: {
  columns: ColumnConfig<T>[];
  data: T[];
}): JSX.Element {
  return (
    <table className="table table-condensed">
      {columns.length > 0 && (
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col.header}</th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {data.map((row, rowIdx) => (
          <tr key={rowIdx}>
            {columns.map((col, colIdx) => {
              const value = col.getValue(row);
              if (colIdx === 0) {
                return <th key={colIdx}>{value}</th>;
              }
              return <td key={colIdx}>{value}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

/**
 * Displays defensive mitigation timeline tooltip.
 */
MageStatistic.DefensiveTooltip = function DefensiveTooltip<
  Apply extends EventType,
  Remove extends EventType,
>({ analyzer }: { analyzer: MajorDefensive<Apply, Remove> }): JSX.Element | null {
  const { fight } = useFight();

  if (analyzer.mitigations.length === 0) {
    return null;
  }

  return (
    <div>
      <MitigationRowContainer>
        <strong>Time</strong>
        <strong>Mit.</strong>
      </MitigationRowContainer>
      {analyzer.mitigations.map((mit) => (
        <MitigationRow
          mitigation={mit}
          segments={analyzer.mitigationSegments(mit)}
          fightStart={fight.start_time}
          maxValue={Math.max.apply(
            null,
            analyzer.mitigations.map((mit) => mit.amount),
          )}
          key={mit.start.timestamp}
        />
      ))}
    </div>
  );
};

export default MageStatistic;
