import React from 'react';
import PropTypes from 'prop-types';
import { FlexibleWidthXYPlot as XYPlot, XAxis, YAxis, AreaSeries, LineSeries, MarkSeries, Hint } from 'react-vis/es';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import StatTracker from 'parser/shared/modules/StatTracker';
import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import SpellLink from 'common/SpellLink';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { formatNumber, formatPercentage } from 'common/format';

import SpellUsable from '../../core/SpellUsable';
import './StraightNoChaser.scss';

const SNC_PROC_CHANCE = 0.08;

class StraightNoChaserGraph extends React.Component {
  static propTypes = {
    resetProbabilities: PropTypes.arrayOf(
      PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
      })
    ).isRequired,
    actualReset: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }).isRequired,
  };

  state = {
    hover: null,
  };

  render() {
    const { resetProbabilities, actualReset } = this.props;
    return (
      <XYPlot
        height={150}
        yDomain={[0, 0.4]}
        onMouseLeave={() => this.setState({ hover: null })}
      >
        <XAxis
          title="Charges Gained"
          tickFormat={value => formatNumber(value)}
          style={{ fill: 'white' }}
        />
        <YAxis
          title="Likelihood"
          tickFormat={value => `${formatPercentage(value, 0)}%`}
          style={{ fill: 'white' }}
        />
        <AreaSeries
          data={resetProbabilities}
          color="rgba(255, 139, 45, 0.2)"
          stroke="transparent"
          curve="curveMonotoneX"
        />
        <LineSeries
          data={resetProbabilities}
          opacity={1}
          stroke="rgba(255, 139, 45)"
          strokeStyle="solid"
          curve="curveMonotoneX"
        />
        <MarkSeries
          data={[ actualReset ]}
          color="#00ff96"
          onNearestX={d => this.setState({ hover: d })}
          size={3}
        />
        {this.state.hover && (
          <Hint
            value={this.state.hover}
            align={{
              horizontal: 'right',
              vertical: 'bottom',
            }}
          >
            <div className="react-tooltip-lite straight-no-chaser-tooltip">
              Estimated Charges Gained: {formatNumber(this.state.hover.x)}
            </div>
          </Hint>
        )}
      </XYPlot>
    );
  }
}

export default class StraightNoChaser extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    stats: StatTracker,
    spellUsable: SpellUsable,
  };

  armor = 0;

  get isbCasts() {
    return this.abilityTracker.getAbility(SPELLS.IRONSKIN_BREW.id).casts;
  }

  get resets() {
    return this.spellUsable._SNCResets;
  }

  get uptimePct() {
    return this.selectedCombatant.getBuffUptime(SPELLS.STRAIGHT_NO_CHASER_BUFF.id) / this.owner.fightDuration;
  }

  get avgArmor() {
    return this.armor * this.uptimePct;
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.STRAIGHT_NO_CHASER.id);
    if(!this.active) {
      return;
    }

    this.armor = this.selectedCombatant.traitsBySpellId[SPELLS.STRAIGHT_NO_CHASER.id].reduce((sum, rank) => {
      const [armor] = calculateAzeriteEffects(SPELLS.STRAIGHT_NO_CHASER.id, rank);
      return sum + armor;
    }, 0);

    this.stats.add(SPELLS.STRAIGHT_NO_CHASER.id, {
      armor: this.armor,
    });
  }

  // currently literal copypasta from the `MasteryValue` module. Once
  // we're ready to start moving to next this will get replaced with a
  // generic implementation.
  get plot() {
    // not the most efficient, but close enough and pretty safe
    function binom(n, k) {
      if(k > n) {
        return null;
      }
      if(k === 0) {
        return 1;
      }

      return n / k * binom(n-1, k-1);
    }

    // pmf of the binomial distribution
    const reset_prob = (i) => binom(this.isbCasts, i) * Math.pow(SNC_PROC_CHANCE, i) * Math.pow(1 - SNC_PROC_CHANCE, this.isbCasts - i);

    const resetProbabilities = Array.from({length: this.isbCasts}, (_x, i) => {
      return { x: i, y: reset_prob(i) };
    });

    const actualReset = {
      x: this.resets,
      y: reset_prob(this.resets),
    };

    const RANGE_THRESHOLD = 0.001;
    const rangeMin = resetProbabilities.findIndex(({y}) => y >= RANGE_THRESHOLD);
    const rangeMax = rangeMin + resetProbabilities.slice(rangeMin).findIndex(({y}) => y < RANGE_THRESHOLD);

    return (
      <StraightNoChaserGraph
        actualReset={actualReset}
        resetProbabilities={resetProbabilities.slice(rangeMin, rangeMax + 1)}
      />
    );
  }

  statistic() {
    return (
      <TraitStatisticBox
        trait={SPELLS.STRAIGHT_NO_CHASER.id}
        value={(
          <>
          ≥{this.resets} Charges Gained<br />
          {formatNumber(this.avgArmor)} Armor Gained
          </>
        )}
        tooltip={`There are no logged events for SNC's generated brew charges, so this is an <em>estimate</em> based on casts that occurred while your brews are on cooldown. <b>If you have low cast efficiency, this will be <em>underestimated!</em></b><br/><br/>Straight, No Chaser gave <b>${this.armor}</b> armor, and was up for ${formatPercentage(this.uptimePct)}% of the fight.`}
      >
        <div style={{padding: '8px'}}>
          {this.plot}
          <p>Likelihood of getting <em>exactly</em> as many extra charges as estimated on a fight given your number of <SpellLink id={SPELLS.IRONSKIN_BREW.id} /> casts.</p>
        </div>
      </TraitStatisticBox>
    );
  }
}
