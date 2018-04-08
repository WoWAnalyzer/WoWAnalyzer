import React from 'react';
import { Line as LineChart } from 'react-chartjs-2';
import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';
import { formatNumber, formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import 'common/chartjs-plugin-vertical';

/**
 * Goal is to remove pressure from healers by selfhealing more when really needed (eg. at low health) / improving tanks reactive selfhealing timings
*/

class SelfHealTimingGraph extends Analyzer {
  
  _hpEvents = [];
  _deathEvents = [];
  _selfhealTimestamps = [];


  selfHealSpell = SPELLS.HEALTHSTONE;
  tabTitle = "Selheal Timing";
  tabURL = 'selfheal-timings';

  on_toPlayer_death(event) {
    this._deathEvents.push(event);
  }

  on_toPlayer_damage(event) {
    this._hpEvents.push(event);
  }

  on_toPlayer_heal(event) {
    this._hpEvents.push(event);

    if (event.ability.guid === this.selfHealSpell.id && event.sourceID === event.targetID) {
      this._selfhealTimestamps.push(event);
    }
  }

  plot(selfHealSpell) {
    const labels = Array.from({length: Math.ceil(this.owner.fightDuration / 1000)}, (x, i) => i);
    const hpBySeconds = labels.reduce((obj, sec) => {
      obj[sec] = undefined;
      return obj;
    }, {});

    const selfheals = this._selfhealTimestamps.map(event => { 
      return { seconds: Math.floor((event.timestamp - this.owner.fight.start_time) / 1000) - 1, ...event };
    });

    const deaths = this._deathEvents.map(({ timestamp, killingAbility }) => {
      return { 
        seconds: Math.floor((timestamp - this.owner.fight.start_time) / 1000),
        ability: killingAbility,
      };
    });

    this._hpEvents.forEach(({ timestamp, hitPoints, maxHitPoints }) => {
      const seconds = Math.floor((timestamp - this.owner.fight.start_time) / 1000);

      let percent = Math.round((hitPoints / maxHitPoints) * 100, 2);
      if (percent > 100) { //maxHitPoints cam sometimes be bigger than hitPoints (esp BDKs with often changing maxHP)
        percent = 100;
      }

      if(!!hitPoints) {
        hpBySeconds[seconds] = { 
          hitPoints: hitPoints, 
          maxHitPoints: maxHitPoints,
          percentage: percent,
        };
      }
    });

    let lastHpContents = { hitPoints: 0, maxHitPoints: 0 , percentage: 0 };
    for(const label in labels) {

      if(hpBySeconds[label] === undefined) {
        hpBySeconds[label] = lastHpContents;
      } else {
        lastHpContents = hpBySeconds[label];
      }

      if(!!deaths.find(event => event.seconds === Number(label))) {
        lastHpContents = { hitPoints: 0, maxHitPoints: lastHpContents.maxHitPoints };
      }
    }

    const selfHealCastsBySeconds = Object.keys(hpBySeconds).map(sec => {
      const deathstrikeEvent = selfheals.find(event => event.seconds === Number(sec));
      if(!!deathstrikeEvent) {
        return { hp: hpBySeconds[sec].percentage, ...deathstrikeEvent };
      } else {
        return undefined;
      }
    });

    const deathsBySeconds = Object.keys(hpBySeconds).map(sec => {
      const deathEvent = deaths.find(event => event.seconds === Number(sec));
      if(!!deathEvent) {
        return { hp: hpBySeconds[sec].percentage, ...deathEvent };
      } else {
        return undefined;
      }
    });

    const DEATH_LABEL = 'Player Death';
    const SELFHEAL_LABEL = selfHealSpell.name + ' Cast';
    const HP_LABEL = 'Health';
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
          label: HP_LABEL,
          data: Object.values(hpBySeconds).map(({ percentage }) => percentage),
          backgroundColor: 'rgba(255, 139, 45, 0.2)',
          borderColor: 'rgb(255, 139, 45)',
          borderWidth: 2,
          pointStyle: 'rect',
        },
        {
          label: SELFHEAL_LABEL,
          data: selfHealCastsBySeconds.map(obj => !!obj ? obj.hp : undefined),
          backgroundColor: 'rgba(255, 255, 255, 0)',
          pointBackgroundColor: 'rgba(255, 255, 255, 0.9)',
          pointRadius: 4,
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

    function tooltip(selfhealBySecond) {
      if (selfhealBySecond.overheal > 0) {
        console.log( selfHealSpell.name );
        return `${ selfHealSpell.name } for ${ formatNumber(selfhealBySecond.amount) } (${ formatNumber(selfhealBySecond.overheal) } overhealing) at ${ formatNumber(selfhealBySecond.hitPoints) } HP`;
      } else {
        return `${ selfHealSpell.name } for ${ formatNumber(selfhealBySecond.amount) } at ${ formatNumber(selfhealBySecond.hitPoints) } HP`;
      }
    }

    // labels an item in the tooltip
    function labelItem(tooltipItem, data) {
      const { index } = tooltipItem;
      const dataset = data.datasets[tooltipItem.datasetIndex];

      switch(dataset.label) {
        case DEATH_LABEL:
          return `Player died when hit by ${safeAbilityName(deathsBySeconds[index].ability)} at ${formatNumber(deathsBySeconds[index].hp)}% HP.`;
        case SELFHEAL_LABEL:
          return tooltip(selfHealCastsBySeconds[index]);
        default:
          if (selfHealCastsBySeconds[index] !== undefined) {
            return `${tooltip(selfHealCastsBySeconds[index])} (${formatNumber(tooltipItem.yLabel)}%)`;
          } else {
            return `${dataset.label}: ${formatNumber(tooltipItem.yLabel)}%`;
          }
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
                  callback: function(x) {
                    const label = formatDuration(x, 1); // formatDuration got changed -- need 1000=1 or it blows up, but that adds a .0 to it
                    return label.substring(0, label.length - 2);
                  },
                },
              }],
              yAxes: [{
                labelString: 'Damage',
                ticks: {
                  beginAtZero: true,
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
      title: this.tabTitle,
      url: this.tabURL,
      render: () => (
        <Tab>
          {this.plot(this.selfHealSpell)}
          <div style={{paddingLeft: "1em"}}>
            This plot shows you your <SpellLink id={this.selfHealSpell.id} /> casts relative to your Health Points to help you improve your <SpellLink id={this.selfHealSpell.id} /> timings.<br/>
            Improving those timings by selfhealing at low health and the correct time will remove a lot of pressure from your healers.
          </div>
        </Tab>
      ),
    };
  }
}

export default SelfHealTimingGraph;
