import React from 'react';
import PropTypes from 'prop-types';

import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';

const PATIENT_SNIPER_BONUS_PER_SEC = 0.06;

class PatientSniperBreakdown extends React.Component {
  static propTypes = {
    vulnerableModifier: PropTypes.number.isRequired,
    patientSniper: PropTypes.object.isRequired,
    hasPiercingShot: PropTypes.bool.isRequired,
  };

  render() {
    const { vulnerableModifier, patientSniper, hasPiercingShot } = this.props;

    // used for iterating as we can't have for loops there
    const seconds = [0, 1, 2, 3, 4, 5, 6];
    const abilities = [SPELLS.AIMED_SHOT.id];
    if (hasPiercingShot) {
      abilities.push(SPELLS.PIERCING_SHOT_TALENT.id);
    }

    // renders div with 1 or 2 tables (for Aimed and Piercing Shot if talented), first row shows data outside of Vulnerable, following rows (mapped from seconds) shows data inside each time window of Vulnerable
    return (
      <div>
        {
          // for each ability (depending on whether we have PS or not), render a table
          abilities.map(ability => {
            const data = patientSniper[ability]; // for shortening of the code
            return (
              <table className="data-table" style={{ align: 'left', padding: '10px', float: 'left', margin: '2px' }}>
                <thead>
                  <tr>
                    <th><dfn data-tip="The time that has passed since Vulnerable was applied to the target">Time into Vulnerable</dfn></th>
                    <th><dfn data-tip="This shows how much damage your shots gained compared to hitting at 0s passed of Vulnerable, so this will show how much dmg you gained from having the Patient Sniper talent in %">% dmg change</dfn></th>
                    <th><dfn data-tip="The amount of casts in this timeframe (0 seconds into vulnerable being 0->0.99 into the vulnerable debuff, 1 sec into vulnerable being 1-1.99 into the debuff etc) when you did NOT have trueshot up">Casts without <SpellLink id={SPELLS.TRUESHOT.id} /> </dfn></th>

                    <th><dfn data-tip="The percentage of your total casts that hit this specific timeframe">% of total casts without <SpellLink id={SPELLS.TRUESHOT.id} /></dfn></th>
                    <th><dfn data-tip="The amount of casts in this timeframe (0 seconds into vulnerable being 0->0.99 into the vulnerable debuff, 1 sec into vulnerable being 1-1.99 into the debuff etc) when you DID have trueshot up">Casts with <SpellLink id={SPELLS.TRUESHOT.id} /></dfn></th>
                    <th><dfn data-tip="The percentage of your total casts that hit this specific timeframe">% of total casts with <SpellLink id={SPELLS.TRUESHOT.id} /></dfn></th>
                    <th><dfn data-tip="Actual bonus damage done in this timeframe">Bonus damage</dfn></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <SpellIcon id={ability} />{'  '}
                      outside of <SpellLink id={SPELLS.VULNERABLE.id} />
                    </td>
                    <td>{formatPercentage((1 / (1 + vulnerableModifier)) - 1)}%</td>
                    <td>{data.noTS.noVulnerable}</td>
                    <td>{formatPercentage(data.noTS.noVulnerable / data.noTS.count)}%</td>
                    <td>{data.TS.noVulnerable}</td>
                    <td>{formatPercentage(data.TS.noVulnerable / data.TS.count)}%</td>
                    <td>0</td>
                  </tr>
                  {
                    seconds.map(sec => {
                      // for each second passed, calculate the bonus over Vulnerable without Patient Sniper, render a row
                      const bonus = ((1 + vulnerableModifier + (sec * PATIENT_SNIPER_BONUS_PER_SEC)) / (1 + vulnerableModifier)) - 1;
                      return (
                        <tr>
                          <td>
                            <SpellIcon id={ability} />{'  '}
                            {sec} sec into <SpellLink id={SPELLS.VULNERABLE.id} />
                          </td>
                          <td>{formatPercentage(bonus)}%</td>
                          <td>{data.noTS.seconds[sec].count}</td>
                          <td>{formatPercentage(data.noTS.seconds[sec].count / data.noTS.count)}%</td>
                          <td>{data.TS.seconds[sec].count}</td>
                          <td>{formatPercentage(data.TS.seconds[sec].count / data.TS.count)}%</td>
                          <td>{formatNumber(data.noTS.seconds[sec].damage + data.TS.seconds[sec].damage)}</td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            );
          })
        }
      </div>
    );
  }
}

export default PatientSniperBreakdown;
