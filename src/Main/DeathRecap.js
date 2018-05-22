import React from 'react';
import PropTypes from 'prop-types';
import SpellIcon from 'common/SpellIcon';
import Icon from 'common/Icon';
import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const SHOW_SECONDS_BEFORE_DEATH = 10;
const AMOUNT_THRESHOLD =  0;

class DeathRecap extends React.PureComponent {

  static propTypes = {
    events: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      detailedView: 0,
      amountThreshold: AMOUNT_THRESHOLD,
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    const clicked = event === this.state.detailedView ? -1 : event;
    this.setState({ detailedView: clicked });
  }

  render() {
    let lastHitPoints = 0;
    let lastMaxHitPoints = 0;

    const sliderProps = {
      min: 0,
      max: 1,
      step: 0.05,
      marks: {
        0: '0%',
        0.1: '10%',
        0.2: '20%',
        0.3: '30%',
        0.4: '40%',
        0.5: '50%',
        0.6: '60%',
        0.7: '70%',
        0.8: '80%',
        0.9: '90%',
        1: '100%',
      },
      style: { 
        margin: '0px 2em 4em 2em',
        width: 'calc(100% - 4em)',
      },
    };

    const events = this.props.events;

    return (
      <div>
        <div style={{ margin: '2em 2em 0 2em' }}>
          Filter events based on min amount (percentage of players health):
        </div>
        <Slider
          {...sliderProps}
          defaultValue={this.state.amountThreshold}
          onChange={(value) => {
            this.setState({
              amountThreshold: value,
            });
          }}
        />
        {events.map((death, i) => 
          <div className="item-divider-top">
            <h2 onClick={() => this.handleClick(i)} style={{ padding: '10px 20px', cursor: 'pointer' }}>Death #{i + 1}</h2>
            <table style={{ display: this.state.detailedView === i ? 'block' : 'none' }} className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Ability</th>
                  <th>HP</th>
                  <th>Amount</th>
                  <th>Defensive Buffs/Debuffs</th>
                  <th>Personals available</th>
                </tr>
              </thead>
              <tbody>
                {death.events
                  .filter(e => e.timestamp <= death.deathtime && e.timestamp >= death.deathtime - (SHOW_SECONDS_BEFORE_DEATH * 1000))
                  .filter(e => ((e.amount + (e.absorbed || 0)) / e.maxHitPoints > this.state.amountThreshold) || e.type === 'instakill')
                  .map((event, index) => {
                  if (event.hitPoints && event.maxHitPoints) {
                    lastHitPoints = event.hitPoints;
                    lastMaxHitPoints = event.maxHitPoints;
                  }
                  
                  const hitPercent = event.amount / lastMaxHitPoints;
                  let percent = 0;
                  let output = null;
                  if (event.type === 'heal') {
                    percent = (lastHitPoints - event.amount) / lastMaxHitPoints;
                    output = <React.Fragment>
                      <span style={{ color: 'green' }}>
                        +{formatNumber(event.amount)} {event.overheal > 0 ? `(O: ${formatNumber(event.overheal)} )` : ''}
                      </span>
                    </React.Fragment>;
                  } else if (event.type === 'damage') {
                    percent = lastHitPoints / lastMaxHitPoints;
                    output = <React.Fragment>
                      <span style={{ color: 'red' }}>
                        -{formatNumber(event.amount)} {event.absorbed > 0 ? `(A: ${formatNumber(event.absorbed)} )` : ''}
                      </span>
                    </React.Fragment>;
                  } else if (event.type === 'instakill') {
                    percent = 0;
                    output = '1-Shot';
                  }

                  if (event.overkill || event.hitPoints === 0) {
                    percent = 0;
                  }

                  return (
                    <tr>
                      <td style={{ width: '5%'}}>
                        {formatDuration(event.time / 1000, 2)}
                      </td>
                      <td style={{ width: '20%'}}>
                        <Icon icon={event.ability.abilityIcon} /> {event.ability.name}
                      </td>
                      <td style={{ width: '20%'}}>
                        <div className="flex performance-bar-container">
                          {percent !== 0 && (
                            <div className="flex-sub performance-bar" style={{ color: 'white', width: formatPercentage(percent) + "%" }}></div>
                          )}
                          <div 
                            className={`flex-sub performance-bar`} 
                            style={{ 
                              backgroundColor: event.type === 'heal' ? 'green' : 'red', 
                              width: formatPercentage(hitPercent) + "%", 
                              opacity: event.type === 'heal' ? .8 : .4 }}
                          >
                          </div>
                        </div>
                      </td>
                      <td style={{ width: '15%'}}>
                        {output}
                      </td>
                      <td style={{ width: '20%' }}>
                        {event.buffsUp && event.buffsUp.map(e =>
                          <SpellIcon style={{ border: '1px solid rgba(0, 0, 0, 0)'}} id={e.spell ? e.spell.id : e} />
                        )}<br/>
                        {event.debuffsUp && event.debuffsUp.map(e =>
                          <SpellIcon style={{ border: '1px solid red'}} id={e.ability ? e.ability.guid : e} />
                        )}
                      </td>
                      <td style={{ width: '15%' }}>
                        {event.cooldownsAvailable.map(e =>
                          <SpellIcon id={e.spell.id} />
                        )}
                        {event.cooldownsUsed.map(e =>
                          <SpellIcon id={e.spell.id} style={{ opacity: .2 }} />
                        )}
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td></td>
                  <td colSpan="6">
                    You died
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
}

export default DeathRecap;
