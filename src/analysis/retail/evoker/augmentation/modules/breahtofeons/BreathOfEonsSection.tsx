import React from 'react';
import { BreathOfEonsWindows } from './BreathOfEonsRotational';
import { SubSection } from 'interface/guide';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import '../Styling.scss';
import ExplanationGraph from 'analysis/retail/evoker/shared/modules/components/ExplanationGraph';
import {
  GraphDataType,
  SpellTracker,
} from 'analysis/retail/evoker/shared/modules/components/types';
import generateExplanations from './generateExplanations';

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
  const graphData: GraphDataType[] = [];
  const explanations: JSX.Element[] = generateExplanations({
    windows,
    graphData,
    ebonMightCount,
    shiftingSandsCount,
  });

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
