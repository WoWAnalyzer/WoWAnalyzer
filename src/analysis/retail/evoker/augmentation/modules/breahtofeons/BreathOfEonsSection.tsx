import React, { useState } from 'react';
import { BreathOfEonsWindows, SpellTracker } from './BreathOfEonsRotational';
import { SubSection } from 'interface/guide';
import { SpellLink, TooltipElement } from 'interface';
import { formatNumber } from 'common/format';
import BreathOfEonsGraph from './BreathOfEonsGraph';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import PassFailBar from 'interface/guide/components/PassFailBar';
import './Section.scss';
import { t } from '@lingui/macro';

type Props = {
  windows: BreathOfEonsWindows[];
  fightStartTime: number;
  ebonMightCount: SpellTracker[];
  shiftingSandsCount: SpellTracker[];
};

const BreathOfEonsSection: React.FC<Props> = ({
  windows,
  fightStartTime,
  ebonMightCount,
  shiftingSandsCount,
}) => {
  /** Logic for handling display of windows */
  const [currentWindowIndex, setCurrentWindowIndex] = useState(0);

  const goToNextWindow = () => {
    setCurrentWindowIndex((prevIndex) => (prevIndex + 1) % windows.length);
  };
  const goToPrevWindow = () => {
    setCurrentWindowIndex((prevIndex) => (prevIndex - 1 + windows.length) % windows.length);
  };

  const currentWindow = windows[currentWindowIndex];
  const breathPerformance = currentWindow.breathPerformance;

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
        {breathPerformance.timeskipTalented && (
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
        )}
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
      <div className="breath-explanation-container">
        <table className="breath-explanations">
          <tbody>
            <tr>
              <td>Ebon Might Uptime</td>
              <td className="pass-fail-counts">
                {' '}
                {(
                  (currentWindow.end -
                    currentWindow.start -
                    breathPerformance.ebonMightDroppedDuration) /
                  1000
                ).toFixed(1)}
                s / {((currentWindow.end - currentWindow.start) / 1000).toFixed(1)}s
              </td>
              <td>
                <PassFailBar
                  pass={
                    currentWindow.end -
                    currentWindow.start -
                    breathPerformance.ebonMightDroppedDuration
                  }
                  total={currentWindow.end - currentWindow.start}
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
                {formatNumber(breathPerformance.damage)} /{' '}
                {formatNumber(breathPerformance.damage + breathPerformance.potentialLostDamage)}
              </td>
              <td>
                <PassFailBar
                  pass={breathPerformance.damage}
                  total={breathPerformance.damage + breathPerformance.potentialLostDamage}
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
                {breathPerformance.fireBreaths} / {breathPerformance.possibleFireBreaths}
              </td>
              <td>
                <PassFailBar
                  pass={breathPerformance.fireBreaths}
                  total={breathPerformance.possibleFireBreaths}
                />
              </td>
            </tr>

            <tr>
              <td>
                <SpellLink spell={SPELLS.UPHEAVAL} /> casts{' '}
              </td>
              <td>
                {breathPerformance.upheavels} / {breathPerformance.possibleUpheavels}
              </td>
              <td>
                <PassFailBar
                  pass={breathPerformance.upheavels}
                  total={breathPerformance.possibleUpheavels}
                />
              </td>
            </tr>
            {breathPerformance.timeskipTalented && (
              <tr>
                <td>
                  <SpellLink spell={TALENTS.TIME_SKIP_TALENT} /> casts{' '}
                </td>
                <td>
                  {breathPerformance.timeSkips} / {breathPerformance.possibleTimeSkips}
                </td>
                <td>
                  <PassFailBar
                    pass={breathPerformance.timeSkips}
                    total={breathPerformance.possibleTimeSkips}
                  />
                </td>
              </tr>
            )}
            <tr>
              <td>Potion used </td>
              <td>
                {breathPerformance.potionUsed} / {breathPerformance.possiblePotions}
              </td>
              <td>
                <PassFailBar
                  pass={breathPerformance.potionUsed}
                  total={breathPerformance.possiblePotions}
                />
              </td>
            </tr>
            {breathPerformance.possibleTrinkets >= 0 && (
              <tr>
                <td>Trinket used </td>
                <td>
                  {breathPerformance.trinketUsed} / {breathPerformance.possibleTrinkets}
                </td>
                <td>
                  <PassFailBar
                    pass={breathPerformance.trinketUsed}
                    total={breathPerformance.possibleTrinkets}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="graph-window-container">
          <header>
            <span>
              Breath Window: {currentWindowIndex + 1} out of {windows.length}
            </span>
            <div className="btn-group">
              <button onClick={goToPrevWindow} disabled={currentWindowIndex === 0}>
                <span
                  className="icon-button glyphicon glyphicon-chevron-left"
                  aria-hidden="true"
                ></span>
              </button>
              <button onClick={goToNextWindow} disabled={currentWindowIndex === windows.length - 1}>
                <span
                  className="icon-button glyphicon glyphicon-chevron-right"
                  aria-hidden="true"
                ></span>
              </button>
            </div>
          </header>
          {breathPerformance.temporalWoundsCounter.length > 0 ? (
            <BreathOfEonsGraph
              window={currentWindow}
              fightStartTime={fightStartTime}
              ebonMightCount={ebonMightCount}
              shiftingSandsCount={shiftingSandsCount}
            />
          ) : (
            <div>
              You failed to hit anything with your{' '}
              <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} />!
            </div>
          )}
        </div>
      </div>
    </SubSection>
  );
};

export default BreathOfEonsSection;
