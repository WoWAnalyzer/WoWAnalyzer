import React from 'react';
import { Line as LineChart } from 'react-chartjs-2';
import 'common/chartjs-plugin-vertical';

import { formatDuration, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer from 'parser/core/Analyzer';
import Panel from 'interface/others/Panel';

import StaggerFabricator from '../core/StaggerFabricator';

/**
 * A graph of staggered damage (and related quantities) over time.
 *
 * The idea of this is to help people identify the root cause of:
 *   - overly high dtps (purifying well after a peak instead of at the peak)
 *   - death (stagger ticking too high? one-shot? health trickling away without heals?)
 *
 * As well as just giving a generally interesting look into when damage
 * actually hit your health bar on a fight.
 */
class StaggerPoolGraph extends Analyzer {
  static dependencies = {
    fab: StaggerFabricator,
  };

  _hpEvents = [];
  _staggerEvents = [];
  _deathEvents = [];
  _purifyTimestamps = [];

  on_addstagger(event) {
    this._staggerEvents.push(event);
  }

  on_removestagger(event) {
    if (event.trigger.ability && event.trigger.ability.guid === SPELLS.PURIFYING_BREW.id) {
      // record the *previous* timestamp for purification. this will
      // make the purifies line up with peaks in the plot, instead of
      // showing up *after* peaks
      this._purifyTimestamps.push(this._staggerEvents[this._staggerEvents.length-1].timestamp);
    }

    this._staggerEvents.push(event);
  }

  on_toPlayer_death(event) {
    this._deathEvents.push(event);
  }

  on_toPlayer_damage(event) {
    this._hpEvents.push(event);
  }

  on_toPlayer_heal(event) {
    this._hpEvents.push(event);
  }

  plot() {
    // x indices
    const labels = Array.from({ length: Math.ceil(this.owner.fightDuration / 500) }, (x, i) => i);

    // somethingByLabels are all objects mapping from label ->
    // something, where if a value is unknown for that timestamp it is
    // undefined (the key is still present).
    const poolByLabels = labels.reduce((obj, sec) => {
      obj[sec] = undefined;
      return obj;
    }, {});
    const hpByLabels = Object.assign({}, poolByLabels);

    const purifies = this._purifyTimestamps.map(timestamp => Math.floor((timestamp - this.owner.fight.start_time) / 500));
    const deaths = this._deathEvents.map(({ timestamp, killingAbility }) => {
      return {
        label: Math.floor((timestamp - this.owner.fight.start_time) / 500),
        ability: killingAbility,
      };
    });

    this._staggerEvents.forEach(({ timestamp, newPooledDamage }) => {
      const label = Math.floor((timestamp - this.owner.fight.start_time) / 500);
      // show the peak rather than left or right edge of the bin. this
      // can cause display issues if there is a rapid sequence of
      // hit->purify->hit but has the upside of making purifies after
      // big hits (aka good purifies) very visible.
      //
      // note for future me: upping resolution from 1s -> 500ms
      // eliminated the issue mentioned above
      poolByLabels[label] = (poolByLabels[label] > newPooledDamage) ? poolByLabels[label] : newPooledDamage;
    });

    this._hpEvents.forEach(({ timestamp, hitPoints, maxHitPoints }) => {
      const label = Math.floor((timestamp - this.owner.fight.start_time) / 500);
      // we fill in the blanks later if hitPoints is not defined
      if (!!hitPoints) {
        hpByLabels[label] = { hitPoints, maxHitPoints };
      }
    });

    // fill in blanks. after deaths hp and stagger should be set to
    // zero. in periods of no activity, the same hp/stagger should be
    // preserved.
    //
    // you might wonder "but i thought stagger ticked twice a second? so
    // either you're dead or damage is incoming!" Friendo, let me
    // introduce you to the joy of stagger pausing: BoC + ISB pauses the
    // dot for 3 seconds so we may have gaps where we are *not* dead and
    // also not taking damage
    let lastPoolContents = 0;
    let lastHpContents = { hitPoints: 0, maxHitPoints: 0 };
    for (const label in labels) {
      if (poolByLabels[label] === undefined) {
        poolByLabels[label] = lastPoolContents;
      } else {
        lastPoolContents = poolByLabels[label];
      }

      if (hpByLabels[label] === undefined) {
        hpByLabels[label] = lastHpContents;
      } else {
        lastHpContents = hpByLabels[label];
      }

      if (!!deaths.find(event => event.label === Number(label))) {
        lastPoolContents = 0;
        lastHpContents = { hitPoints: 0, maxHitPoints: lastHpContents.maxHitPoints };
      }
    }

    const deathsByLabels = Object.keys(hpByLabels).map(label => {
      const deathEvent = deaths.find(event => event.label === Number(label));
      if (!!deathEvent) {
        return { hp: hpByLabels[label].maxHitPoints, ...deathEvent };
      } else {
        return undefined;
      }
    });

    const labelIndices = Object.keys(poolByLabels).reduce ((obj, label, index) => { obj[label] = index; return obj; }, {});

    // some labels are referred to later for drawing tooltips
    const DEATH_LABEL = 'Player Death';
    const PURIFY_LABEL = 'Purifying Brew Cast';
    const HP_LABEL = 'Health';
    const STAGGER_LABEL = 'Stagger Pool Size';
    const chartData = {
      labels,
      datasets: [
        {
          label: DEATH_LABEL,
          borderColor: '#ff2222',
          borderWidth: 2,
          data: deathsByLabels.map(obj => !!obj ? obj.hp : undefined),
          pointStyle: 'line',
          verticalLine: true,
        },
        {
          label: 'Max Health',
          data: Object.values(hpByLabels).map(({ maxHitPoints }) => maxHitPoints),
          backgroundColor: 'rgba(255, 139, 45, 0.0)',
          borderColor: 'rgb(183, 76, 75)',
          borderWidth: 2,
          pointStyle: 'line',
        },
        {
          label: HP_LABEL,
          data: Object.values(hpByLabels).map(({ hitPoints }) => hitPoints),
          backgroundColor: 'rgba(255, 139, 45, 0.2)',
          borderColor: 'rgb(255, 139, 45)',
          borderWidth: 2,
          pointStyle: 'rect',
        },
        {
          label: PURIFY_LABEL,
          backgroundColor: '#00ff96',
          data: purifies.map(label => { return { x: labelIndices[String(label)], y: poolByLabels[String(label)] }; }),
          type: 'scatter',
          pointRadius: 4,
          showLine: false,
        },
        {
          label: STAGGER_LABEL,
          data: Object.values(poolByLabels),
          backgroundColor: 'rgba(240, 234, 214, 0.2)',
          borderColor: 'rgb(240, 234, 214)',
          borderWidth: 2,
          pointStyle: 'rect',
        },
      ],
    };

    function safeAbilityName(ability) {
      if (ability === undefined || ability.name === undefined) {
        return 'an Unknown Ability';
      } else {
        return ability.name;
      }
    }

    // labels an item in the tooltip
    function labelItem(tooltipItem, data) {
      const { index } = tooltipItem;
      const dataset = data.datasets[tooltipItem.datasetIndex];
      switch (dataset.label) {
        case DEATH_LABEL:
          return `Player died when hit by ${safeAbilityName(deathsByLabels[index].ability)} at ${formatNumber(deathsByLabels[index].hp)} HP.`;
        case PURIFY_LABEL:
          return `Purifying Brew cast with ${formatNumber(tooltipItem.yLabel)} damage staggered.`;
        default:
          return `${dataset.label}: ${formatNumber(tooltipItem.yLabel)}`;
      }
    }

    return (
      <div className="graph-container">
        <LineChart
          data={chartData}
          height={100}
          width={300}
          options={{
            tooltips: {
              callbacks: {
                label: labelItem.bind(this),
              },
            },
            legend: {
              labels: {
                usePointStyle: true,
                fontColor: '#ccc',
              },
            },
            animation: {
              duration: 0,
            },
            elements: {
              line: {
                tension: 0,
              },
              point: {
                radius: 0,
                hitRadius: 4,
                hoverRadius: 4,
              },
            },
            scales: {
              xAxes: [{
                labelString: 'Time',
                ticks: {
                  fontColor: '#ccc',
                  callback: function (x) {
                    const label = formatDuration(Math.floor(x/2), 1); // formatDuration got changed -- need precision=1 or it blows up, but that adds a .0 to it
                    return label.substring(0, label.length - 2);
                  },
                },
              }],
              yAxes: [{
                labelString: 'Damage',
                ticks: {
                  fontColor: '#ccc',
                  callback: formatNumber,
                },
              }],
            },
          }}
        />
      </div>
    );
  }

  tab() {
    return {
      title: 'Stagger',
      url: 'stagger',
      render: () => (
        <Panel
          title="Stagger"
          explanation={(
            <>
              Damage you take is placed into a <em>pool</em> by <SpellLink id={SPELLS.STAGGER.id} />. This damage is then removed by the damage-over-time component of <SpellLink id={SPELLS.STAGGER.id} /> or by <SpellLink id={SPELLS.PURIFYING_BREW.id} /> (or other sources of purification). This plot shows the amount of damage pooled over the course of the fight.
            </>
          )}
        >
          {this.plot()}
        </Panel>
      ),
    };
  }
}

export default StaggerPoolGraph;
