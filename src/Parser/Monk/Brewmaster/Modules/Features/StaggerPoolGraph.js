import React from 'react';
import { Line as LineChart } from 'react-chartjs-2';
import 'common/chartjs-plugin-vertical';

import { formatDuration, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';

import StaggerFabricator from '../Core/StaggerFabricator';

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
    this._staggerEvents.push(event);

    if (event.trigger.ability && event.trigger.ability.guid === SPELLS.PURIFYING_BREW.id) {
      this._purifyTimestamps.push(event.timestamp);
    }
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
    const labels = Array.from({ length: Math.ceil(this.owner.fightDuration / 1000) }, (x, i) => i);

    // somethingBySeconds are all objects mapping from seconds ->
    // something, where if a value is unknown for that timestamp it is
    // undefined (the key is still present)
    const poolBySeconds = labels.reduce((obj, sec) => {
      obj[sec] = undefined;
      return obj;
    }, {});
    const hpBySeconds = Object.assign({}, poolBySeconds);

    const purifies = this._purifyTimestamps.map(timestamp => Math.floor((timestamp - this.owner.fight.start_time) / 1000) - 1);
    const deaths = this._deathEvents.map(({ timestamp, killingAbility }) => {
      return {
        seconds: Math.floor((timestamp - this.owner.fight.start_time) / 1000),
        ability: killingAbility,
      };
    });

    this._staggerEvents.forEach(({ timestamp, newPooledDamage }) => {
      const seconds = Math.floor((timestamp - this.owner.fight.start_time) / 1000);
      // for simplicity, we plot the right-edge of each bin. stagger
      // actually ticks twice a second
      poolBySeconds[seconds] = newPooledDamage;
    });

    this._hpEvents.forEach(({ timestamp, hitPoints, maxHitPoints }) => {
      const seconds = Math.floor((timestamp - this.owner.fight.start_time) / 1000);
      // we fill in the blanks later if hitPoints is not defined
      if (!!hitPoints) {
        hpBySeconds[seconds] = { hitPoints, maxHitPoints };
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
      if (poolBySeconds[label] === undefined) {
        poolBySeconds[label] = lastPoolContents;
      } else {
        lastPoolContents = poolBySeconds[label];
      }

      if (hpBySeconds[label] === undefined) {
        hpBySeconds[label] = lastHpContents;
      } else {
        lastHpContents = hpBySeconds[label];
      }

      if (!!deaths.find(event => event.seconds === Number(label))) {
        lastPoolContents = 0;
        lastHpContents = { hitPoints: 0, maxHitPoints: lastHpContents.maxHitPoints };
      }
    }

    const purifiesBySeconds = Object.keys(poolBySeconds).map(sec => {
      if (purifies.includes(Number(sec))) {
        return poolBySeconds[sec];
      } else {
        return undefined;
      }
    });

    const deathsBySeconds = Object.keys(hpBySeconds).map(sec => {
      const deathEvent = deaths.find(event => event.seconds === Number(sec));
      if (!!deathEvent) {
        return { hp: hpBySeconds[sec].maxHitPoints, ...deathEvent };
      } else {
        return undefined;
      }
    });

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
          data: deathsBySeconds.map(obj => !!obj ? obj.hp : undefined),
          pointStyle: 'line',
          verticalLine: true,
        },
        {
          label: 'Max Health',
          data: Object.values(hpBySeconds).map(({ maxHitPoints }) => maxHitPoints),
          backgroundColor: 'rgba(255, 139, 45, 0.0)',
          borderColor: 'rgb(183, 76, 75)',
          borderWidth: 2,
          pointStyle: 'line',
        },
        {
          label: HP_LABEL,
          data: Object.values(hpBySeconds).map(({ hitPoints }) => hitPoints),
          backgroundColor: 'rgba(255, 139, 45, 0.2)',
          borderColor: 'rgb(255, 139, 45)',
          borderWidth: 2,
          pointStyle: 'rect',
        },
        {
          label: PURIFY_LABEL,
          pointBackgroundColor: '#00ff96',
          backgroundColor: '#00ff96',
          data: purifiesBySeconds,
          fillOpacity: 0,
          pointRadius: 4,
        },
        {
          label: STAGGER_LABEL,
          data: Object.values(poolBySeconds),
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
          return `Player died when hit by ${safeAbilityName(deathsBySeconds[index].ability)} at ${formatNumber(deathsBySeconds[index].hp)} HP.`;
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
                label: labelItem,
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
                    const label = formatDuration(x, 1); // formatDuration got changed -- need precision=1 or it blows up, but that adds a .0 to it
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
      title: 'Stagger Pool',
      url: 'stagger-pool',
      render: () => (
        <Tab title="Stagger Pool">
          {this.plot()}
          <div style={{ paddingLeft: "1em" }}>
            Damage you take is placed into a <em>pool</em> by <SpellLink id={SPELLS.STAGGER.id} icon />. This damage is then removed by the damage-over-time component of <SpellLink id={SPELLS.STAGGER.id} icon /> or by <SpellLink id={SPELLS.PURIFYING_BREW.id} icon /> (or other sources of purification). This plot shows the amount of damage pooled over the course of the fight.
          </div>
        </Tab>
      ),
    };
  }
}

export default StaggerPoolGraph;
