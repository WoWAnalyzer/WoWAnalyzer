import CombatLogParser from 'parser/core/CombatLogParser';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import T31TierSet from './tier/T31MWTier';
import { SpellLink, TooltipElement } from 'interface';
import Panel from 'parser/ui/Panel';
import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import Toggle from 'react-toggle';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { TIERS } from 'game/TIERS';
import { CHI_HARMONY_COLLECTION } from '../../constants';

interface Props {
  analyzer: T31TierSet;
  owner: CombatLogParser;
}

export const ChiHarmonyHealingBreakdown = ({
  analyzer: { fourPieceSourceMap, fourPieceHealing },
  owner: { fightDuration },
}: Props) => {
  const [absolute, setAbsolute] = useState(false);
  const onAbsoluteToggle = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setAbsolute(event.target.checked);
  }, []);

  const tableBody = useMemo(() => {
    let last = 0;
    let rawTotal = 0;
    fourPieceSourceMap.forEach((map) => {
      last = last > map.rawAmount ? last : map.rawAmount;
      rawTotal += map.rawAmount;
    });

    return (
      <tbody>
        {fourPieceSourceMap &&
          [...fourPieceSourceMap.entries()]
            .sort((a, b) => b[1].rawAmount - a[1].rawAmount)
            .map((map) => {
              console.log('spellId? - ', map[0]);

              const { ability, healing } = { ability: map[0], healing: map[1] };

              const currentTotal = absolute ? rawTotal : fourPieceHealing; // TODO total raw contribution

              return (
                <>
                  <tr key={ability}>
                    <td style={{ width: '30%' }}>
                      <SpellLink spell={ability} />
                    </td>
                    <td style={{ paddingRight: 5, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {formatPercentage(
                        ((healing?.rawAmount || 0) * CHI_HARMONY_COLLECTION) / currentTotal,
                      )}
                      %
                    </td>
                    <td style={{ width: '70%' }}>
                      <div
                        className="performance-bar"
                        style={{
                          width: `${((healing?.rawAmount || 0) / last) * 100}%`,
                          backgroundColor: 'rgb(0, 255, 152)',
                        }}
                      />
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <TooltipElement
                        content={`${formatNumber(
                          (((healing?.rawAmount || 0) * CHI_HARMONY_COLLECTION) / fightDuration) *
                            1000,
                        )} HPS`}
                      >
                        Total: {formatNumber(healing?.rawAmount || 0)}
                      </TooltipElement>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {formatPercentage((healing?.overheal || 0) / (healing?.rawAmount || 0))} %
                    </td>
                  </tr>
                </>
              );
            })}
      </tbody>
    );
  }, [fourPieceSourceMap, fourPieceHealing, fightDuration, absolute]);

  return (
    <div>
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ fontWeight: 700, textTransform: 'uppercase' }}>Spell</th>
            <th style={{ fontWeight: 700, textTransform: 'uppercase' }}>Contribution</th>
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

class T31HealingBreakdown extends Analyzer {
  static dependencies = {
    t31Tierset: T31TierSet,
  };
  protected t31Tierset!: T31TierSet;
  has2Piece: boolean = true;
  has4Piece: boolean = true;

  constructor(options: Options) {
    super(options);
    this.has2Piece = this.selectedCombatant.has2PieceByTier(TIERS.T31);
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.T31) && this.has2Piece;
    this.active = this.has2Piece;
    if (!this.active) {
      return;
    }
  }

  statistic() {
    return (
      <Panel
        title="Chi Harmony Sources"
        explanation={
          <>
            This shows a breakdown of the healing that contributied to{' '}
            <SpellLink spell={SPELLS.CHI_HARMONY_HEAL} /> healing.
          </>
        }
        position={90}
        pad={false}
      >
        <ChiHarmonyHealingBreakdown analyzer={this.t31Tierset} owner={this.owner} />
      </Panel>
    );
  }
}

export default T31HealingBreakdown;
