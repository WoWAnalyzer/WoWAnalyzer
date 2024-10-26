import AtonementHealingDone from 'analysis/retail/priest/discipline/modules/features/AtonementHealingDone';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { Icon } from 'interface';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import CombatLogParser from 'parser/core/CombatLogParser';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import Toggle from 'react-toggle';
import { abilityToSpell } from 'common/abilityToSpell';

interface Props {
  analyzer: AtonementHealingDone;
  owner: CombatLogParser;
}

const getReason = (spellId: string) => {
  switch (Number(spellId)) {
    case -2: // Melee
      return <SpellLink spell={SPELLS.LIGHTSPAWN} />;
    default:
      return null;
  }
};

const AtonementHealingBreakdown = ({
  analyzer: { totalAtonement, bySource, total },
  owner: { fightDuration },
}: Props) => {
  const [absolute, setAbsolute] = useState(false);

  const onAbsoluteToggle = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setAbsolute(event.target.checked);
  }, []);

  const tableBody = useMemo(() => {
    const highestHealing = Object.keys(bySource)
      .map((key) => bySource[key])
      .reduce((highest, source) => Math.max(highest, source.healing.effective), 1);

    return (
      <tbody>
        {bySource &&
          Object.keys(bySource)
            .sort((a, b) => bySource[b].healing.effective - bySource[a].healing.effective)
            .map((spellId) => {
              const { ability, healing } = bySource[spellId];

              const currentTotal = absolute ? total : totalAtonement.effective;
              const reason = getReason(spellId);

              return (
                <tr key={ability.guid}>
                  <td style={{ width: '30%' }}>
                    <SpellLink spell={abilityToSpell(ability)} icon={false}>
                      <Icon icon={ability.abilityIcon} /> {ability.name}
                    </SpellLink>
                    {reason && <> ({reason})</>}
                  </td>
                  <td style={{ paddingRight: 5, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {formatPercentage(healing.effective / currentTotal)} %
                  </td>
                  <td style={{ width: '70%' }}>
                    {/* TODO: Color the bar based on the damage type, physical = yellow, chaos = gradient, etc. idk */}
                    <div
                      className="performance-bar"
                      style={{ width: `${(healing.effective / highestHealing) * 100}%` }}
                    />
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <TooltipElement content={`Total: ${formatNumber(healing.effective)}`}>
                      {formatNumber((healing.effective / fightDuration) * 1000)} HPS
                    </TooltipElement>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {formatPercentage(healing.overheal / healing.raw)} %
                  </td>
                </tr>
              );
            })}
      </tbody>
    );
  }, [totalAtonement, bySource, total, fightDuration, absolute]);

  return (
    <div>
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ fontWeight: 700, textTransform: 'uppercase' }}>Name</th>
            <th style={{ fontWeight: 700, textTransform: 'uppercase' }}>Healing</th>
            <th colSpan={2}>
              <div className="text-right toggle-control">
                <Toggle
                  defaultChecked={false}
                  icons={false}
                  onChange={onAbsoluteToggle}
                  id="absolute-toggle"
                />
                <label htmlFor="absolute-toggle" style={{ marginLeft: '0.5em' }}>
                  relative to total healing
                </label>
              </div>
            </th>
            <th style={{ fontWeight: 700, textTransform: 'uppercase' }}>Overheal</th>
          </tr>
        </thead>
        {tableBody}
      </table>
    </div>
  );
};

export default AtonementHealingBreakdown;
