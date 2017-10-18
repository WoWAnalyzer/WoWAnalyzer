import React from 'react';
import PropTypes from 'prop-types';

import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

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
    return (
      <div>
        {
          // for each ability (depending on whether we have PS or not), render a table
          abilities.map(ability => {
            const data = patientSniper[ability]; // for shortening of the code
            return (
              <table className="data-table" style={{ borderBottom: '1px solid #dddddd', borderTop: '1px solid #dddddd', align: 'left', padding: '10px', float: 'left', margin: '2px' }}>
                <thead>
                  <tr>
                    <th><dfn data-tip="The time that has passed since Vulnerable was applied to the target">Time into Vulnerable</dfn></th>
                    <th><dfn data-tip="This showcases how much damage your shots gained compared to hitting at 0s passed of Vulnerable, so this will showcase how much dmg you gained from having the Patient Sniper talent in %">% dmg change</dfn></th>
                    <th><dfn data-tip="The amount of casts in this timeframe (0 seconds into vulnerable being 0->0.99 into the vulnerable debuff, 1 sec into vulnerable being 1-1.99 into the debuff etc) when you did NOT have trueshot up">Casts without <SpellLink id={SPELLS.TRUESHOT.id} /> </dfn></th>

                    <th><dfn data-tip="The percentage of your total casts that hit this specific timeframe">% of total casts without <SpellLink id={SPELLS.TRUESHOT.id} /></dfn></th>
                    <th><dfn data-tip="The amount of casts in this timeframe (0 seconds into vulnerable being 0->0.99 into the vulnerable debuff, 1 sec into vulnerable being 1-1.99 into the debuff etc) when you DID have trueshot up">Casts with <SpellLink id={SPELLS.TRUESHOT.id} /></dfn></th>
                    <th><dfn data-tip="The percentage of your total casts that hit this specific timeframe">% of total casts with <SpellLink id={SPELLS.TRUESHOT.id} /></dfn></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <SpellIcon id={ability} />{'  '}
                      outside of <SpellLink id={SPELLS.VULNERABLE.id} />
                    </td>
                    {/*<td>{formatPercentage((1 / (1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed)) - 1)}%</td>*/}
                    <td></td>
                    <td>{data.noTS.noVulnerable}</td>
                    <td>{formatPercentage(data.noTS.noVulnerable / data.noTS.count)}%</td>
                    <td>{data.TS.noVulnerable}</td>
                    <td>{formatPercentage(data.TS.noVulnerable / data.TS.count)}%</td>
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
                         <td>{data.noTS.seconds[sec]}</td>
                         <td>{formatPercentage(data.noTS.seconds[sec] / data.noTS.count)}%</td>
                         <td>{data.TS.seconds[sec]}</td>
                         <td>{formatPercentage(data.TS.seconds[sec] / data.TS.count)}%</td>
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
