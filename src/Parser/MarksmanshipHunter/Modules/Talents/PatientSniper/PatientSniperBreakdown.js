import React from 'react';
import PropTypes from 'prop-types';

import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

class PatientSniperBreakdown extends React.Component {
  static propTypes = {
    patientSniper: PropTypes.object.isRequired,
  };

  render() {
    const { patientSniper } = this.props;
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
              <th><dfn data-tip="The amount of casts in this timeframe (0 seconds into vulnerable being 0->0.99 into the vulnerable debuff, 1 sec into vulnerable being 1-1.99 into the debuff etc)">Casts excluding <SpellLink id={SPELLS.TRUESHOT.id}/> </dfn></th>

              <th><dfn data-tip="The percentage of your total casts that hit this specific timeframe">% of total casts excluding <SpellLink id={SPELLS.TRUESHOT.id}/></dfn></th>
              <th><dfn data-tip="The percentage of your total casts that hit this specific timeframe">Casts including <SpellLink id={SPELLS.TRUESHOT.id}/></dfn></th>
              <th><dfn data-tip="The percentage of your total casts that hit this specific timeframe">% of total casts including <SpellLink id={SPELLS.TRUESHOT.id}/></dfn></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                outside of <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage((1 / (1 + patientSniper.vulnerableModifer)) - 1)}%</td>
              <td>{patientSniper.modules.patientSniperTracker.patientSniper.fourSecondsIntoVulnerableAimed}</td>
              <td>{formatPercentage(patientSniper.modules.patientSniperTracker.patientSniper.nonVulnerableAimedShots / patientSniper.modules.patientSniperTracker.patientSniper.aimedShotsNoTS)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                0 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + patientSniper.modules.patientSniperTracker.vulnerableModifer + (patientSniperPercentPrRank * 0)) / (1 + patientSniper.modules.patientSniperTracker.vulnerableModifer)) - 1)}%</td>
              <td>{patientSniper.modules.patientSniperTracker.zeroSecondsIntoVulnerableAimed}</td>

              <td>{formatPercentage(patientSniper.modules.patientSniperTracker.zeroSecondsIntoVulnerableAimed / patientSniper.modules.patientSniperTracker.totalAimedShots)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                1 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + patientSniper.modules.patientSniperTracker.vulnerableModifer + (patientSniperPercentPrRank * 1)) / (1 + patientSniper.modules.patientSniperTracker.vulnerableModifer)) - 1)}%</td>
              <td>{patientSniper.modules.patientSniperTracker.oneSecondIntoVulnerableAimed}</td>
              <td>{formatPercentage(patientSniper.modules.patientSniperTracker.oneSecondIntoVulnerableAimed / patientSniper.modules.patientSniperTracker.totalAimedShots)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                2 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + patientSniper.modules.patientSniperTracker.vulnerableModifer + (patientSniperPercentPrRank * 2)) / (1 + patientSniper.modules.patientSniperTracker.vulnerableModifer)) - 1)}%</td>
              <td>{patientSniper.modules.patientSniperTracker.twoSecondsIntoVulnerableAimed}</td>
              <td>{formatPercentage(patientSniper.modules.patientSniperTracker.twoSecondsIntoVulnerableAimed / patientSniper.modules.patientSniperTracker.totalAimedShots)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                3 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + patientSniper.modules.patientSniperTracker.vulnerableModifer + (patientSniperPercentPrRank * 3)) / (1 + patientSniper.modules.patientSniperTracker.vulnerableModifer)) - 1)}%</td>
              <td>{patientSniper.modules.patientSniperTracker.threeSecondsIntoVulnerableAimed}</td>
              <td>{formatPercentage(patientSniper.modules.patientSniperTracker.threeSecondsIntoVulnerableAimed / patientSniper.modules.patientSniperTracker.totalAimedShots)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                4 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + patientSniper.modules.patientSniperTracker.vulnerableModifer + (patientSniperPercentPrRank * 4)) / (1 + patientSniper.modules.patientSniperTracker.vulnerableModifer)) - 1)}%</td>
              <td>{patientSniper.modules.patientSniperTracker.fourSecondsIntoVulnerableAimed}</td>
              <td>{formatPercentage(patientSniper.modules.patientSniperTracker.fourSecondsIntoVulnerableAimed / patientSniper.modules.patientSniperTracker.totalAimedShots)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                5 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + patientSniper.modules.patientSniperTracker.vulnerableModifer + (patientSniperPercentPrRank * 5)) / (1 + patientSniper.modules.patientSniperTracker.vulnerableModifer)) - 1)}%</td>
              <td>{patientSniper.modules.patientSniperTracker.fiveSecondsIntoVulnerableAimed}</td>
              <td>{formatPercentage(patientSniper.modules.patientSniperTracker.fiveSecondsIntoVulnerableAimed / patientSniper.modules.patientSniperTracker.totalAimedShots)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                6 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + patientSniper.modules.patientSniperTracker.vulnerableModifer + (patientSniperPercentPrRank * 6)) / (1 + patientSniper.modules.patientSniperTracker.vulnerableModifer)) - 1)}%</td>
              <td>{patientSniper.modules.patientSniperTracker.sixSecondsIntoVulnerableAimed}</td>
              <td>{formatPercentage(patientSniper.modules.patientSniperTracker.sixSecondsIntoVulnerableAimed / patientSniper.modules.patientSniperTracker.totalAimedShots)}%</td>
            </tr>
            <th>
            </th>
            <tr style={styles.cellBorder}>
              <td>
                <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} />{'  '}
                outside of <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1) / (1 + patientSniper.modules.patientSniperTracker.vulnerableModifer)) - 1)}%</td>
              <td>{patientSniper.modules.patientSniperTracker.nonVulnerablePiercingShots}</td>
              <td>{formatPercentage(patientSniper.modules.patientSniperTracker.nonVulnerablePiercingShots / patientSniper.modules.patientSniperTracker.totalPiercingShots)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} />{'  '}
                0 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + patientSniper.modules.patientSniperTracker.vulnerableModifer + (patientSniperPercentPrRank * 0)) / (1 + patientSniper.modules.patientSniperTracker.vulnerableModifer)) - 1)}%</td>
              <td>{patientSniper.modules.patientSniperTracker.zeroSecondsIntoVulnerablePiercing}</td>
              <td>{formatPercentage(patientSniper.modules.patientSniperTracker.zeroSecondsIntoVulnerablePiercing / patientSniper.modules.patientSniperTracker.totalPiercingShots)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} />{'  '}
                1 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + patientSniper.modules.patientSniperTracker.vulnerableModifer + (patientSniperPercentPrRank * 1)) / (1 + patientSniper.modules.patientSniperTracker.vulnerableModifer)) - 1)}%</td>
              <td>{patientSniper.modules.patientSniperTracker.oneSecondIntoVulnerablePiercing}</td>
              <td>{formatPercentage(patientSniper.modules.patientSniperTracker.oneSecondIntoVulnerablePiercing / patientSniper.modules.patientSniperTracker.totalPiercingShots)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} />{'  '}
                2 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
                <td>{formatPercentage(((1 + patientSniper.modules.patientSniperTracker.vulnerableModifer + (patientSniperPercentPrRank * 2)) / (1 + patientSniper.modules.patientSniperTracker.vulnerableModifer)) - 1)}%</td>
              <td>{patientSniper.modules.patientSniperTracker.twoSecondsIntoVulnerablePiercing}</td>
              <td>{formatPercentage(patientSniper.modules.patientSniperTracker.twoSecondsIntoVulnerablePiercing / patientSniper.modules.patientSniperTracker.totalPiercingShots)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} />{'  '}
                3 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + patientSniper.modules.patientSniperTracker.vulnerableModifer + (patientSniperPercentPrRank * 3)) / (1 + patientSniper.modules.patientSniperTracker.vulnerableModifer)) - 1)}%</td>
              <td>{patientSniper.modules.patientSniperTracker.threeSecondsIntoVulnerablePiercing}</td>
              <td>{formatPercentage(patientSniper.modules.patientSniperTracker.threeSecondsIntoVulnerablePiercing / patientSniper.modules.patientSniperTracker.totalPiercingShots)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} />{'  '}
                4 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + patientSniper.modules.patientSniperTracker.vulnerableModifer + (patientSniperPercentPrRank * 4)) / (1 + patientSniper.modules.patientSniperTracker.vulnerableModifer)) - 1)}%</td>
              <td>{patientSniper.modules.patientSniperTracker.fourSecondsIntoVulnerablePiercing}</td>
              <td>{formatPercentage(patientSniper.modules.patientSniperTracker.fourSecondsIntoVulnerablePiercing / patientSniper.modules.patientSniperTracker.totalPiercingShots)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} />{'  '}
                5 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + patientSniper.modules.patientSniperTracker.vulnerableModifer + (patientSniperPercentPrRank * 5)) / (1 + patientSniper.modules.patientSniperTracker.vulnerableModifer)) - 1)}%</td>
              <td>{patientSniper.modules.patientSniperTracker.fiveSecondsIntoVulnerablePiercing}</td>
              <td>{formatPercentage(patientSniper.modules.patientSniperTracker.fiveSecondsIntoVulnerablePiercing / patientSniper.modules.patientSniperTracker.totalPiercingShots)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} />{'  '}
                6 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + patientSniper.modules.patientSniperTracker.vulnerableModifer + (patientSniperPercentPrRank * 6)) / (1 + patientSniper.modules.patientSniperTracker.vulnerableModifer)) - 1)}%</td>
              <td>{patientSniper.modules.patientSniperTracker.sixSecondsIntoVulnerablePiercing}</td>
              <td>{formatPercentage(patientSniper.modules.patientSniperTracker.sixSecondsIntoVulnerablePiercing / patientSniper.modules.patientSniperTracker.totalPiercingShots)}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default PatientSniperBreakdown;
