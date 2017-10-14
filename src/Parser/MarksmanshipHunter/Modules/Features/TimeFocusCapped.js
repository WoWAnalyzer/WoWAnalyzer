import React from 'react';
import {HorizontalBar} from 'react-chartjs-2';
import Module from 'Parser/Core/Module';
import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';

import FocusTracker from '../FocusChart/FocusTracker';

class TimeFocusCapped extends Module {
  static dependencies = {
    focusTracker: FocusTracker,
  };
  centerStyle = {textAlign:'center'};

  getData(){
    this.cData = {
      labels: [''],
      datasets: [
        {
          label: 'Time Not Focus Capped',
          backgroundColor: 'rgba(127,255,0,1)',
          borderColor: 'rgba(0,0,0,1)',
          borderWidth: 2,

          data: [Math.round((this.owner.fightDuration / 1000)-this.focusTracker.secondsCapped)],
        },
        {
          label: 'test2',
          backgroundColor: 'rgba(255,255,255,1)',
          borderColor: 'rgba(0,0,0,1)',
          borderWidth: 2,

          data: [Math.round(this.focusTracker.secondsCapped)],
        },
      ],
    };
    this.cOptions = {
      scaleBeginAtZero: true,
      tooltips:{
        enabled: false,
      },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [{
          gridlines:{
            display:false,
          },
          ticks:{
            display:false,
            max: Math.ceil(this.owner.fightDuration / 1000),
          },  
          barPercentage: 1,
          categoryPercentage: 1,
          stacked: true,
        }],
        yAxes: [{
          gridlines:{
            display:false,
          },  
          ticks:{
            display:false,
          }, 
          barPercentage: 1,
          categoryPercentage: 1,
          stacked: true,  
        }],
      },
    };
    
  }

  chartData(){
    this.getData();
    return(
      <HorizontalBar 
        data = {this.cData}
        height = {15}
        width = {75}
        options = {this.cOptions}
      />
    );
  }

  statistic() {
    const tooltipData = "You wasted " + Math.round(this.focusTracker.secondsCapped) + " seconds focus capped. <br /> That's approx. " + Math.round(this.focusTracker.secondsCapped/(this.owner.fightDuration/1000) * 100) + "% of the fight. <br /> For more details, see the Focus Chart tab.";
    return (
      <StatisticsListBox
        title="FOCUS-CAPPED"
        tooltip= {tooltipData}
      >
      <div style = {this.centerStyle}>
      Time not Focus-Capped: {Math.round((this.owner.fightDuration / 1000 - this.focusTracker.secondsCapped) * 100) / 100}s / {Math.floor(this.owner.fightDuration / 1000)}s
      </div>
      {this.chartData()}
      </StatisticsListBox>
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default TimeFocusCapped;
