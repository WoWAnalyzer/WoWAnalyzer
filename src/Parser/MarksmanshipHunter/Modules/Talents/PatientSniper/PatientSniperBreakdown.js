import React from 'react';
import PropTypes from 'prop-types';
import Combatants from 'Parser/Core/Modules/Combatants';

import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

class PatientSniperBreakdown extends React.Component {
  static propTypes = {
    patientSniper: PropTypes.object.isRequired,
    combatants: Combatants,

  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.PATIENT_SNIPER_TALENT.id);
  }

  render() {
    const patientSniperPercentPrRank = 0.06;

    const styles = {
      cellBorder: { borderTop: '.5px solid #dddddd' },
      table: { borderBottom: '1px solid #dddddd', borderTop: '1px solid #dddddd', align: 'left', padding: '10px', float: 'left', margin: '2px' },
    };
      return (
        <div>
          <table className="data-table" style={styles.table}>
            <thead>
              <tr>
                <th><dfn data-tip="The time that has passed since Vulnerable was applied to the target">Time into Vulnerable</dfn></th>
                <th><dfn data-tip="This showcases how much damage your shots gained compared to hitting at 0s passed of Patient Sniper, so this will showcase how much dmg you gained from having the Patient Sniper talent in %">% dmg change</dfn></th>
                <th><dfn data-tip="The amount of casts in this timeframe (0 seconds into vulnerable being 0->0.99 into the vulnerable debuff, 1 sec into vulnerable being 1-1.99 into the debuff etc)">Casts excluding <SpellLink id={SPELLS.TRUESHOT.id} /> </dfn></th>

                <th><dfn data-tip="The percentage of your total casts that hit this specific timeframe">% of total casts excluding <SpellLink id={SPELLS.TRUESHOT.id} /></dfn></th>
                <th><dfn data-tip="The percentage of your total casts that hit this specific timeframe">Casts including <SpellLink id={SPELLS.TRUESHOT.id} /></dfn></th>
                <th><dfn data-tip="The percentage of your total casts that hit this specific timeframe">% of total casts including <SpellLink id={SPELLS.TRUESHOT.id} /></dfn></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                  outside of <SpellLink id={SPELLS.VULNERABLE.id} />
                </td>
                <td>{formatPercentage((1 / (1 + this.vulnerableModifer)) - 1)}%</td>
                <td>{this.nonVulnerableAimedShots}</td>
                <td>{formatPercentage(this.nonVulnerableAimedShots / this.aimedShotsNoTS)}%</td>
                <td>{this.nonVulnerableAimedShotsTS}</td>
                <td>{formatPercentage(this.nonVulnerableAimedShotsTS / this.aimedShotsWithTS)}%</td>
              </tr>
              <tr>
                <td>
                  <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                  0 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
                </td>
                <td>{formatPercentage(((1 + this.vulnerableModifer + (patientSniperPercentPrRank * 0)) / (1 + this.vulnerableModifer)) - 1)}%</td>
                <td>{this.zeroSecondsIntoVulnerableAimed}</td>
                <td>{formatPercentage(this.zeroSecondsIntoVulnerableAimed / this.aimedShotsNoTS)}%</td>
                <td>{this.nonVulnerableAimedShotsTS}</td>
                <td>{formatPercentage(this.nonVulnerableAimedShotsTS / this.aimedShotsWithTS)}%</td>
              </tr>
              <tr>
                <td>
                  <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                  1 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
                </td>
                <td>{formatPercentage(((1 + this.vulnerableModifer + (patientSniperPercentPrRank * 1)) / (1 + this.vulnerableModifer)) - 1)}%</td>
                <td>{this.oneSecondIntoVulnerableAimed}</td>
                <td>{formatPercentage(this.oneSecondIntoVulnerableAimed / this.aimedShotsNoTS)}%</td>
                <td>{this.oneSecondIntoVulnerableAimedTS}</td>
                <td>{formatPercentage(this.oneSecondIntoVulnerableAimedTS / this.aimedShotsWithTS)}%</td>
              </tr>
              <tr>
                <td>
                  <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                  2 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
                </td>
                <td>{formatPercentage(((1 + this.vulnerableModifer + (patientSniperPercentPrRank * 2)) / (1 + this.vulnerableModifer)) - 1)}%</td>
                <td>{this.twoSecondsIntoVulnerableAimed}</td>
                <td>{formatPercentage(this.twoSecondsIntoVulnerableAimed / this.aimedShotsNoTS)}%</td>
                <td>{this.twoSecondsIntoVulnerableAimedTS}</td>
                <td>{formatPercentage(this.twoSecondsIntoVulnerableAimedTS / this.aimedShotsWithTS)}%</td>
              </tr>
              <tr>
                <td>
                  <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                  3 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
                </td>
                <td>{formatPercentage(((1 + this.vulnerableModifer + (patientSniperPercentPrRank * 3)) / (1 + this.vulnerableModifer)) - 1)}%</td>
                <td>{this.threeSecondsIntoVulnerableAimed}</td>
                <td>{formatPercentage(this.threeSecondsIntoVulnerableAimed / this.aimedShotsNoTS)}%</td>
                <td>{this.threeSecondsIntoVulnerableAimedTS}</td>
                <td>{formatPercentage(this.threeSecondsIntoVulnerableAimedTS / this.aimedShotsWithTS)}%</td>
              </tr>
              <tr>
                <td>
                  <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                  4 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
                </td>
                <td>{formatPercentage(((1 + this.vulnerableModifer + (patientSniperPercentPrRank * 4)) / (1 + this.vulnerableModifer)) - 1)}%</td>
                <td>{this.fourSecondsIntoVulnerableAimed}</td>
                <td>{formatPercentage(this.fourSecondsIntoVulnerableAimed / this.aimedShotsNoTS)}%</td>
                <td>{this.fourSecondsIntoVulnerableAimedTS}</td>
                <td>{formatPercentage(this.fourSecondsIntoVulnerableAimedTS / this.aimedShotsWithTS)}%</td>
              </tr>
              <tr>
                <td>
                  <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                  5 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
                </td>
                <td>{formatPercentage(((1 + this.vulnerableModifer + (patientSniperPercentPrRank * 5)) / (1 + this.vulnerableModifer)) - 1)}%</td>
                <td>{this.fiveSecondsIntoVulnerableAimed}</td>
                <td>{formatPercentage(this.fiveSecondsIntoVulnerableAimed / this.aimedShotsNoTS)}%</td>
                <td>{this.fiveSecondsIntoVulnerableAimedTS}</td>
                <td>{formatPercentage(this.fiveSecondsIntoVulnerableAimedTS / this.aimedShotsWithTS)}%</td>
              </tr>
              <tr>
                <td>
                  <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                  6 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
                </td>
                <td>{formatPercentage(((1 + this.vulnerableModifer + (patientSniperPercentPrRank * 6)) / (1 + this.vulnerableModifer)) - 1)}%</td>
                <td>{this.sixSecondsIntoVulnerableAimed}</td>
                <td>{formatPercentage(this.sixSecondsIntoVulnerableAimed / this.aimedShotsNoTS)}%</td>
                <td>{this.sixSecondsIntoVulnerableAimedTS}</td>
                <td>{formatPercentage(this.sixSecondsIntoVulnerableAimedTS / this.aimedShotsWithTS)}%</td>
              </tr>
              <th>
              </th>
              <tr style={styles.cellBorder}>
                <td>
                  <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} />{'  '}
                  outside of <SpellLink id={SPELLS.VULNERABLE.id} />
                </td>
                <td>{formatPercentage(((1) / (1 + this.vulnerableModifer)) - 1)}%</td>
                <td>{this.nonVulnerablePiercingShots}</td>
                <td>{formatPercentage(this.nonVulnerablePiercingShots / this.piercingShotsNoTS)}%</td>
                <td>{this.nonVulnerablePiercingShotsTS}</td>
                <td>{formatPercentage(this.nonVulnerablePiercingShotsTS / this.piercingShotsWithTS)}%</td>
              </tr>
              <tr>
                <td>
                  <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} />{'  '}
                  0 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
                </td>
                <td>{formatPercentage(((1 + this.vulnerableModifer + (patientSniperPercentPrRank * 0)) / (1 + this.vulnerableModifer)) - 1)}%</td>
                <td>{this.zeroSecondsIntoVulnerablePiercing}</td>
                <td>{formatPercentage(this.zeroSecondsIntoVulnerablePiercing / this.piercingShotsNoTS)}%</td>
                <td>{this.zeroSecondsIntoVulnerablePiercingTS}</td>
                <td>{formatPercentage(this.zeroSecondsIntoVulnerablePiercingTS / this.piercingShotsWithTS)}%</td>
              </tr>
              <tr>
                <td>
                  <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} />{'  '}
                  1 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
                </td>
                <td>{formatPercentage(((1 + this.vulnerableModifer + (patientSniperPercentPrRank * 1)) / (1 + this.vulnerableModifer)) - 1)}%</td>
                <td>{this.oneSecondIntoVulnerablePiercing}</td>
                <td>{formatPercentage(this.oneSecondIntoVulnerablePiercing / this.piercingShotsNoTS)}%</td>
                <td>{this.oneSecondIntoVulnerablePiercingTS}</td>
                <td>{formatPercentage(this.oneSecondIntoVulnerablePiercingTS / this.piercingShotsWithTS)}%</td>
              </tr>
              <tr>
                <td>
                  <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} />{'  '}
                  2 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
                </td>
                <td>{formatPercentage(((1 + this.vulnerableModifer + (patientSniperPercentPrRank * 2)) / (1 + this.vulnerableModifer)) - 1)}%</td>
                <td>{this.twoSecondsIntoVulnerablePiercing}</td>
                <td>{formatPercentage(this.twoSecondsIntoVulnerablePiercing / this.piercingShotsNoTS)}%</td>
                <td>{this.twoSecondsIntoVulnerablePiercingTS}</td>
                <td>{formatPercentage(this.twoSecondsIntoVulnerablePiercingTS / this.piercingShotsWithTS)}%</td>
              </tr>
              <tr>
                <td>
                  <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} />{'  '}
                  3 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
                </td>
                <td>{formatPercentage(((1 + this.vulnerableModifer + (patientSniperPercentPrRank * 3)) / (1 + this.vulnerableModifer)) - 1)}%</td>
                <td>{this.threeSecondsIntoVulnerablePiercing}</td>
                <td>{formatPercentage(this.threeSecondsIntoVulnerablePiercing / this.piercingShotsNoTS)}%</td>
                <td>{this.threeSecondsIntoVulnerablePiercingTS}</td>
                <td>{formatPercentage(this.threeSecondsIntoVulnerablePiercingTS / this.piercingShotsWithTS)}%</td>
              </tr>
              <tr>
                <td>
                  <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} />{'  '}
                  4 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
                </td>
                <td>{formatPercentage(((1 + this.vulnerableModifer + (patientSniperPercentPrRank * 4)) / (1 + this.vulnerableModifer)) - 1)}%</td>
                <td>{this.fourSecondsIntoVulnerablePiercing}</td>
                <td>{formatPercentage(this.fourSecondsIntoVulnerablePiercing / this.piercingShotsNoTS)}%</td>
                <td>{this.fourSecondsIntoVulnerablePiercingTS}</td>
                <td>{formatPercentage(this.fourSecondsIntoVulnerablePiercingTS / this.piercingShotsWithTS)}%</td>
              </tr>
              <tr>
                <td>
                  <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} />{'  '}
                  5 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
                </td>
                <td>{formatPercentage(((1 + this.vulnerableModifer + (patientSniperPercentPrRank * 5)) / (1 + this.vulnerableModifer)) - 1)}%</td>
                <td>{this.fiveSecondsIntoVulnerablePiercing}</td>
                <td>{formatPercentage(this.fiveSecondsIntoVulnerablePiercing / this.piercingShotsNoTS)}%</td>
                <td>{this.fiveSecondsIntoVulnerablePiercingTS}</td>
                <td>{formatPercentage(this.fiveSecondsIntoVulnerablePiercingTS / this.piercingShotsWithTS)}%</td>
              </tr>
              <tr>
                <td>
                  <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} />{'  '}
                  6 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
                </td>
                <td>{formatPercentage(((1 + this.vulnerableModifer + (patientSniperPercentPrRank * 6)) / (1 + this.vulnerableModifer)) - 1)}%</td>
                <td>{this.sixSecondsIntoVulnerablePiercing}</td>
                <td>{formatPercentage(this.sixSecondsIntoVulnerablePiercing / this.piercingShotsNoTS)}%</td>
                <td>{this.sixSecondsIntoVulnerablePiercingTS}</td>
                <td>{formatPercentage(this.sixSecondsIntoVulnerablePiercingTS / this.piercingShotsWithTS)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
  }
}

export default PatientSniperBreakdown;
