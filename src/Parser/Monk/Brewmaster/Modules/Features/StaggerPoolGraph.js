import React from 'react';
import { Line as LineChart } from 'react-chartjs-2';
import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';

import { formatNumber, formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';

import StaggerFabricator from '../Core/StaggerFabricator';

class StaggerPoolGraph extends Analyzer {
  static dependencies = {
    fab: StaggerFabricator,
  };
  
  _hpEvents = [];
  _staggerEvents = [];
  _purifyTimestamps = [];
  _deathEvents = [];

  on_addstagger(event) {
    this._staggerEvents.push(event);
  }

  on_removestagger(event) {
    this._staggerEvents.push(event);

    if(event.reason.ability && event.reason.ability.guid === SPELLS.PURIFYING_BREW.id) {
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
    const labels = Array.from({length: Math.ceil(this.owner.fightDuration / 1000)}, (x, i) => i);
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
      poolBySeconds[seconds] = newPooledDamage;
    });

    this._hpEvents.forEach(({ timestamp, hitPoints, maxHitPoints }) => {
      const seconds = Math.floor((timestamp - this.owner.fight.start_time) / 1000);
      if(!!hitPoints) {
        // we fill in the blanks later if hitPoints is not defined
        hpBySeconds[seconds] = { hitPoints, maxHitPoints };
      }
    });

    // fix stagger after deaths
    let lastPoolContents = 0;
    let lastHpContents = { hitPoints: 0, maxHitPoints: 0 };
    for(const label in labels) {
      if(poolBySeconds[label] === undefined) {
        poolBySeconds[label] = lastPoolContents;
      } else {
        lastPoolContents = poolBySeconds[label];
      }

      if(hpBySeconds[label] === undefined) {
        hpBySeconds[label] = lastHpContents;
      } else {
        lastHpContents = hpBySeconds[label];
      }

      if(!!deaths.find(event => event.seconds === Number(label))) {
        lastPoolContents = 0;
        lastHpContents = { hitPoints: 0, maxHitPoints: lastHpContents.maxHitPoints };
      }
    }

    const purifiesBySeconds = Object.keys(poolBySeconds).map(sec => {
      if(purifies.includes(Number(sec))) {
        return poolBySeconds[sec];
      } else {
        return undefined;
      }
    });

    const deathsBySeconds = Object.keys(hpBySeconds).map(sec => {
      const deathEvent = deaths.find(event => event.seconds === Number(sec));
      if(!!deathEvent) {
        return { hp: hpBySeconds[sec].maxHitPoints, ...deathEvent };
      } else {
        return undefined;
      }
    });

    const DEATH_LABEL = 'Player Death';
    const PURIFY_LABEL = 'Purifying Brew Cast';
    const HP_LABEL = 'Health';
    const STAGGER_LABEL = 'Stagger Pool Contents';
    const chartData = {
      labels,
      datasets: [ 
        {
          label: DEATH_LABEL,
          backgroundColor: '#ff2222',
          borderColor: '#ff2222',
          borderWidth: 2,
          data: deathsBySeconds.map(obj => !!obj ? obj.hp : undefined),
          pointRadius: 6,
          pointStyle: 'crossRot',
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
      if(ability === undefined || ability.name === undefined) {
        return 'an Unknown Ability';
      } else {
        return ability.name;
      }
    }

    function labelItem(tooltipItem, data) {
      const { index } = tooltipItem;
      const dataset = data.datasets[tooltipItem.datasetIndex];
      switch(dataset.label) {
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
              },
            },
            scales: {
              xAxes: [{
                labelString: 'Time',
                ticks: {
                  fontColor: '#ccc',
                  callback: formatDuration,
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
        </Tab>
      ),
    };
  }
}

export default StaggerPoolGraph;
