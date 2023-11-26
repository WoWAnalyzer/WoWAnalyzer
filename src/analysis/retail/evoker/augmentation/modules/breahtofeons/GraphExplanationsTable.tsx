import React from 'react';
import { BreathOfEonsWindows } from './BreathOfEonsRotational';
import { SpellLink, TooltipElement } from 'interface';
import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import PassFailBar from 'interface/guide/components/PassFailBar';
import '../Styling.scss';
import { t } from '@lingui/macro';

type Props = {
  window: BreathOfEonsWindows;
};

const GraphExplanationsTable: React.FC<Props> = ({ window }) => {
  return (
    <table className="graph-explanations">
      <tbody>
        <tr>
          <td>Ebon Might Uptime</td>
          <td className="pass-fail-counts">
            {' '}
            {(
              (window.end - window.start - window.breathPerformance.ebonMightDroppedDuration) /
              1000
            ).toFixed(1)}
            s / {((window.end - window.start) / 1000).toFixed(1)}s
          </td>
          <td>
            <PassFailBar
              pass={window.end - window.start - window.breathPerformance.ebonMightDroppedDuration}
              total={window.end - window.start}
            />
          </td>
        </tr>

        <tr>
          <td>
            <TooltipElement
              content={t({
                id: 'guide.augmentation.breathofeons.damage',
                message:
                  'This value indicates the amount of damage you did, along with the potential damage you lost to mobs dying early. This value is a guesstimation and therefore not 100% accurate.',
              })}
            >
              Damage
            </TooltipElement>
          </td>
          <td>
            {formatNumber(window.breathPerformance.damage)} /{' '}
            {formatNumber(
              window.breathPerformance.damage + window.breathPerformance.potentialLostDamage,
            )}
          </td>
          <td>
            <PassFailBar
              pass={window.breathPerformance.damage}
              total={window.breathPerformance.damage + window.breathPerformance.potentialLostDamage}
            />
          </td>
        </tr>
      </tbody>
      <tbody>
        <tr>
          <strong>Cast performance</strong>
        </tr>
        <tr>
          <td>
            <SpellLink spell={SPELLS.FIRE_BREATH} /> casts{' '}
          </td>
          <td>
            {window.breathPerformance.fireBreaths} / {window.breathPerformance.possibleFireBreaths}
          </td>
          <td>
            <PassFailBar
              pass={window.breathPerformance.fireBreaths}
              total={window.breathPerformance.possibleFireBreaths}
            />
          </td>
        </tr>

        <tr>
          <td>
            <SpellLink spell={SPELLS.UPHEAVAL} /> casts{' '}
          </td>
          <td>
            {window.breathPerformance.upheavels} / {window.breathPerformance.possibleUpheavels}
          </td>
          <td>
            <PassFailBar
              pass={window.breathPerformance.upheavels}
              total={window.breathPerformance.possibleUpheavels}
            />
          </td>
        </tr>
        {window.breathPerformance.timeskipTalented && (
          <tr>
            <td>
              <SpellLink spell={TALENTS.TIME_SKIP_TALENT} /> casts{' '}
            </td>
            <td>
              {window.breathPerformance.timeSkips} / {window.breathPerformance.possibleTimeSkips}
            </td>
            <td>
              <PassFailBar
                pass={window.breathPerformance.timeSkips}
                total={window.breathPerformance.possibleTimeSkips}
              />
            </td>
          </tr>
        )}
        <tr>
          <td>Potion used </td>
          <td>
            {window.breathPerformance.potionUsed} / {window.breathPerformance.possiblePotions}
          </td>
          <td>
            <PassFailBar
              pass={window.breathPerformance.potionUsed}
              total={window.breathPerformance.possiblePotions}
            />
          </td>
        </tr>
        {window.breathPerformance.possibleTrinkets >= 0 && (
          <tr>
            <td>Trinket used </td>
            <td>
              {window.breathPerformance.trinketUsed} / {window.breathPerformance.possibleTrinkets}
            </td>
            <td>
              <PassFailBar
                pass={window.breathPerformance.trinketUsed}
                total={window.breathPerformance.possibleTrinkets}
              />
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default GraphExplanationsTable;
