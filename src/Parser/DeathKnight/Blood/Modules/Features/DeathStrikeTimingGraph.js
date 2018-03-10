import React from 'react';
import { Line as LineChart } from 'react-chartjs-2';
import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';

import { formatNumber, formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import 'common/chartjs-plugin-vertical';

/**
 * A Copy of Brewmasters Stagger Graph to show Death Strike casts relative to HP
 *
 * Goal is to remove pressure from healers by Death Striking more when really needed (eg. at low health) / improving Death Strike timings
 */
class DeathStrikeTimingGraph extends Analyzer {
  
  _hpEvents = [];
  _deathEvents = [];
  _deathstrikeTimestamps = [];

  on_byPlayer_heal(event) {
    if (event.ability.guid === SPELLS.DEATH_STRIKE_HEAL.id) {
      this._deathstrikeTimestamps.push(event);
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
    //precision 500 = each seconds has 2 entrys to get more precision for HP/DS casts
    //1 entry per second (precision 1000) made the graph to smooth and wouldn't show the direct impact on HP by a DS cast
    const PRECISION = 500;

    // x indices
    const labels = Array.from({length: Math.ceil(this.owner.fightDuration / PRECISION)}, (x, i) => i);

    // somethingBySeconds are all objects mapping from seconds ->
    // something, where if a value is unknown for that timestamp it is
    // undefined (the key is still present)
    const hpBySeconds = labels.reduce((obj, sec) => {
      obj[sec] = undefined;
      return obj;
    }, {});

    const deathstrikes = this._deathstrikeTimestamps.map(event => { 
      return { seconds: Math.floor((event.timestamp - this.owner.fight.start_time) / PRECISION) - 1, ...event };
    });

    const deaths = this._deathEvents.map(({ timestamp, killingAbility }) => {
      return { 
        seconds: Math.floor((timestamp - this.owner.fight.start_time) / PRECISION),
        ability: killingAbility,
      };
    });

    this._hpEvents.forEach(({ timestamp, hitPoints, maxHitPoints }) => {
      const seconds = Math.floor((timestamp - this.owner.fight.start_time) / PRECISION);
      // we fill in the blanks later if hitPoints is not defined
      if(!!hitPoints) {
        hpBySeconds[seconds] = { hitPoints, maxHitPoints };
      }
    });

    // fill in blanks. after deaths hp should be set to
    // zero. in periods of no activity, the same hp should be
    // preserved.
    let maxHP = 0;
    let lastHpContents = { hitPoints: 0, maxHitPoints: 0 };
    for(const label in labels) {

      if(hpBySeconds[label] === undefined) {
        hpBySeconds[label] = lastHpContents;
      } else {
        lastHpContents = hpBySeconds[label];
      }

      if (lastHpContents.maxHitPoints > maxHP) {
        maxHP = lastHpContents.maxHitPoints;
      }

      if(!!deaths.find(event => event.seconds === Number(label))) {
        lastHpContents = { hitPoints: 0, maxHitPoints: lastHpContents.maxHitPoints };
      }
    }

    const deathstrikesBySeconds = Object.keys(hpBySeconds).map(sec => {
      const deathstrikeEvent = deathstrikes.find(event => event.seconds === Number(sec));
      if(!!deathstrikeEvent) {
        //displaying the DS-dot in the plot at a fixed position, showing it at the casts' current HP made it hard to review the tooltip
        return { hp: maxHP * 0.1, ...deathstrikeEvent };
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

    // some labels are referred to later for drawing tooltips
    const DEATH_LABEL = 'Player Death';
    const DS_LABEL = 'Death Strike Cast';
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
          label: 'Max Health',
          data: Object.values(hpBySeconds).map(({ maxHitPoints }) => maxHitPoints),
          backgroundColor: 'rgba(255, 139, 45, 0.0)',
          borderColor: 'rgba(183, 76, 75, 0.4)',
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
          label: DS_LABEL,
          data: deathstrikesBySeconds.map(obj => !!obj ? obj.hp : undefined),
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

    // labels an item in the tooltip
    function labelItem(tooltipItem, data) {
      const { index } = tooltipItem;
      const dataset = data.datasets[tooltipItem.datasetIndex];
      switch(dataset.label) {
        case DEATH_LABEL:
          return `Player died when hit by ${safeAbilityName(deathsBySeconds[index].ability)} at ${formatNumber(deathsBySeconds[index].hp)} HP.`;
        case DS_LABEL:
          if (deathstrikesBySeconds[index].overheal > 0) {
            return `Death Strike for ${ formatNumber(deathstrikesBySeconds[index].amount) } (${ formatNumber(deathstrikesBySeconds[index].overheal) } overhealing) at ${ formatNumber(deathstrikesBySeconds[index].hitPoints) } HP`;
          } else {
            return `Death Strike for ${ formatNumber(deathstrikesBySeconds[index].amount) } at ${ formatNumber(deathstrikesBySeconds[index].hitPoints) } HP`;
          }
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
                  callback: function(x) {
                    const label = formatDuration(x, 1); // formatDuration got changed -- need precision=1 or it blows up, but that adds a .0 to it
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
      title: 'Death Strike Timing',
      url: 'deathstrike-timings',
      render: () => (
        <Tab title="Death Strike Timing">
          {this.plot()}
          <div style={{paddingLeft: "1em"}}>
            This plot shows you your <SpellLink id={SPELLS.DEATH_STRIKE.id} icon /> Casts relative to your Health Points to help you improve your <SpellLink id={SPELLS.DEATH_STRIKE.id} icon /> timings.
            Improving those timings by selfhealing at low health will remove pressure from your healers.
          </div>
        </Tab>
      ),
    };
  }
}

export default DeathStrikeTimingGraph;