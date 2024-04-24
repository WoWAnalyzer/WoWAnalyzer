import React from 'react';
import { BreathOfEonsWindows } from './BreathOfEonsRotational';
import { SubSection } from 'interface/guide';
import { SpellLink, TooltipElement } from 'interface';
import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import PassFailBar from 'interface/guide/components/PassFailBar';
import '../Styling.scss';
import { t } from '@lingui/macro';
import ExplanationGraph, {
  DataSeries,
  GraphData,
  SpellTracker,
  generateGraphData,
} from 'analysis/retail/evoker/shared/modules/components/ExplanationGraph';

type Props = {
  windows: BreathOfEonsWindows[];
  fightStartTime: number;
  fightEndTime: number;
  ebonMightCount: SpellTracker[];
  shiftingSandsCount: SpellTracker[];
};

const BreathOfEonsSection: React.FC<Props> = ({
  windows,
  fightStartTime,
  fightEndTime,
  ebonMightCount,
  shiftingSandsCount,
}) => {
  const graphData: GraphData[] = [];
  const explanations: JSX.Element[] = [];

  /** Generate graph data for Breath Windows */
  if (graphData.length === 0 && windows.length > 0) {
    for (const window of windows) {
      const dataSeries: DataSeries[] = [
        {
          spellTracker: window.breathPerformance.temporalWoundsCounter,
          type: 'area',
          color: '#736F4E',
          label: 'Temporal Wounds',
          strokeWidth: 3,
        },
        {
          spellTracker: window.flightData,
          type: 'area',
          color: '#FF6B6B',
          label: 'Flight Time',
          strokeWidth: 3,
        },
        {
          spellTracker: ebonMightCount,
          type: 'line',
          color: '#F3A738',
          label: 'Ebon Might',
          size: 4,
        },
        {
          spellTracker: shiftingSandsCount,
          type: 'line',
          color: '#F7EC59',
          label: 'Shifting Sands',
          size: 4,
        },
        {
          spellTracker: window.breathPerformance.damageProblemPoints,
          type: 'point',
          color: 'red',
          label: 'Problem Points',
          size: 120,
        },
        {
          spellTracker: window.breathPerformance.ebonMightProblems,
          type: 'point',
          color: 'red',
          label: 'Problem Points',
          size: 120,
        },
      ];
      const error =
        window.breathPerformance.temporalWoundsCounter.length > 0 ? undefined : (
          <div>You didn't hit anything</div>
        );
      const newGraphData = generateGraphData(
        dataSeries,
        window.start - 3000,
        window.end + 3000,
        'Breath Window',
        error,
      );
      graphData.push(newGraphData);

      /** Generate our explanations */
      const content =
        window.breathPerformance.temporalWoundsCounter.length === 0 ? (
          <div></div>
        ) : (
          <table className="graph-explanations">
            <tbody>
              <tr>
                <td>Ebon Might Uptime</td>
                <td className="pass-fail-counts">
                  {' '}
                  {(
                    (window.end -
                      window.start -
                      window.breathPerformance.ebonMightDroppedDuration) /
                    1000
                  ).toFixed(1)}
                  s / {((window.end - window.start) / 1000).toFixed(1)}s
                </td>
                <td>
                  <PassFailBar
                    pass={
                      window.end - window.start - window.breathPerformance.ebonMightDroppedDuration
                    }
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
                    total={
                      window.breathPerformance.damage + window.breathPerformance.potentialLostDamage
                    }
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
                  {window.breathPerformance.fireBreaths} /{' '}
                  {window.breathPerformance.possibleFireBreaths}
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
                  {window.breathPerformance.upheavals} /{' '}
                  {window.breathPerformance.possibleUpheavals}
                </td>
                <td>
                  <PassFailBar
                    pass={window.breathPerformance.upheavals}
                    total={window.breathPerformance.possibleUpheavals}
                  />
                </td>
              </tr>
              {window.breathPerformance.timeskipTalented && (
                <tr>
                  <td>
                    <SpellLink spell={TALENTS.TIME_SKIP_TALENT} /> casts{' '}
                  </td>
                  <td>
                    {window.breathPerformance.timeSkips} /{' '}
                    {window.breathPerformance.possibleTimeSkips}
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
                    {window.breathPerformance.trinketUsed} /{' '}
                    {window.breathPerformance.possibleTrinkets}
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
      explanations.push(content);
    }
  }

  return (
    <SubSection title="Breath of Eons">
      <div>
        <p>
          <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} /> is a powerful cooldown that should be
          used along side your allies cooldowns, since it's a major damage amplifier.{' '}
          <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} /> will replicate damage done by your{' '}
          <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> targets, it is therefore important to
          maintain 100% uptime on <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> during your{' '}
          <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} /> windows.
          <br />
        </p>
        <div>
          <p>
            With <SpellLink spell={TALENTS.TIME_SKIP_TALENT} /> talented, you should aim to use{' '}
            <SpellLink spell={TALENTS.TIME_SKIP_TALENT} /> alongside every other{' '}
            <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} />.{' '}
            <SpellLink spell={TALENTS.TIME_SKIP_TALENT} /> should be used to reduce the cooldown of
            your empowers, <SpellLink spell={SPELLS.FIRE_BREATH} /> and{' '}
            <SpellLink spell={SPELLS.UPHEAVAL} /> to maximize the amount of{' '}
            <SpellLink spell={SPELLS.SHIFTING_SANDS_BUFF} /> buffs you have active.
            <br />
          </p>
          <p>
            You can use the graph below to visualize your buffs:{' '}
            <SpellLink spell={SPELLS.SHIFTING_SANDS_BUFF} />,{' '}
            <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> along with your{' '}
            <SpellLink spell={SPELLS.TEMPORAL_WOUND_DEBUFF} /> debuffs, for each individual{' '}
            <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} /> window. Problem points such as:
            letting <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> drop during your{' '}
            <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} /> windows, or a mob dying before{' '}
            <SpellLink spell={SPELLS.TEMPORAL_WOUND_DEBUFF} /> runs out, will be pointed out.
          </p>
        </div>
      </div>
      <ExplanationGraph
        fightStartTime={fightStartTime}
        fightEndTime={fightEndTime}
        graphData={graphData}
        yAxisName=""
        explanations={explanations}
      />
    </SubSection>
  );
};

export default BreathOfEonsSection;
