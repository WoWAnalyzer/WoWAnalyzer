import React from 'react';
import PropTypes from 'prop-types';
import Combatants from 'Parser/Core/Modules/Combatants';

import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

class PatientSniperBreakdown extends React.Component {
  static dependencies = {
    combatants: Combatants,
  };
  static propTypes = {
    patientSniper: PropTypes.object.isRequired,
  };
  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.PATIENT_SNIPER_TALENT.id);
    this.hasPiercingShot = false;
    if(this.combatants.selected.hasTalent(SPELLS.PIERCING_SHOT_TALENT.id)) {
      this.hasPiercingShot = true;
    }
  }

  render() {
    const patientSniperPercentPrRank = 0.06;

    const styles = {
      cellBorder: { borderTop: '.5px solid #dddddd' },
      table: { borderBottom: '1px solid #dddddd', borderTop: '1px solid #dddddd', align: 'left', padding: '10px', float: 'left', margin: '2px' },
    };
    //Checks
    if(this.hasPiercingShot === true) {
    return (
      <div>
        <table className="data-table" style={styles.table}>
          <thead>
            <tr>
              <th><dfn data-tip="The time that has passed since Vulnerable was applied to the target">Time into Vulnerable</dfn></th>
              <th><dfn data-tip="This showcases how much damage your shots gained compared to hitting at 0s passed of Patient Sniper, so this will showcase how much dmg you gained from having the Patient Sniper talent in %">% dmg change</dfn></th>
              <th><dfn data-tip="The amount of casts in this timeframe (0 seconds into vulnerable being 0->0.99 into the vulnerable debuff, 1 sec into vulnerable being 1-1.99 into the debuff etc) when you did NOT have trueshot up">Casts excluding <SpellLink id={SPELLS.TRUESHOT.id} /> </dfn></th>

              <th><dfn data-tip="The percentage of your total casts that hit this specific timeframe">% of total casts excluding <SpellLink id={SPELLS.TRUESHOT.id} /></dfn></th>
              <th><dfn data-tip="The amount of casts in this timeframe (0 seconds into vulnerable being 0->0.99 into the vulnerable debuff, 1 sec into vulnerable being 1-1.99 into the debuff etc) when you DID have trueshot up">Casts including <SpellLink id={SPELLS.TRUESHOT.id} /></dfn></th>
              <th><dfn data-tip="The percentage of your total casts that hit this specific timeframe">% of total casts including <SpellLink id={SPELLS.TRUESHOT.id} /></dfn></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                outside of <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage((1 / (1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed)) - 1)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].nonVulnerableAimedShots}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].nonVulnerableAimedShots / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsNoTS)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].nonVulnerableAimedShotsTS}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].nonVulnerableAimedShotsTS / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsWithTS)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                0 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed + (patientSniperPercentPrRank * 0)) / (1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed)) - 1)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].zeroSecondsIntoVulnerableAimed}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].zeroSecondsIntoVulnerableAimed / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsNoTS)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].nonVulnerableAimedShotsTS}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].nonVulnerableAimedShotsTS / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsWithTS)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                1 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed + (patientSniperPercentPrRank * 1)) / (1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed)) - 1)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].oneSecondIntoVulnerableAimed}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].oneSecondIntoVulnerableAimed / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsNoTS)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].oneSecondIntoVulnerableAimedTS}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].oneSecondIntoVulnerableAimedTS / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsWithTS)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                2 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed + (patientSniperPercentPrRank * 2)) / (1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed)) - 1)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].twoSecondsIntoVulnerableAimed}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].twoSecondsIntoVulnerableAimed / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsNoTS)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].twoSecondsIntoVulnerableAimedTS}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].twoSecondsIntoVulnerableAimedTS / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsWithTS)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                3 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed + (patientSniperPercentPrRank * 3)) / (1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed)) - 1)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].threeSecondsIntoVulnerableAimed}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].threeSecondsIntoVulnerableAimed / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsNoTS)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].threeSecondsIntoVulnerableAimedTS}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].threeSecondsIntoVulnerableAimedTS / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsWithTS)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                4 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed + (patientSniperPercentPrRank * 4)) / (1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed)) - 1)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].fourSecondsIntoVulnerableAimed}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].fourSecondsIntoVulnerableAimed / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsNoTS)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].fourSecondsIntoVulnerableAimedTS}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].fourSecondsIntoVulnerableAimedTS / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsWithTS)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                5 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed + (patientSniperPercentPrRank * 5)) / (1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed)) - 1)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].fiveSecondsIntoVulnerableAimed}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].fiveSecondsIntoVulnerableAimed / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsNoTS)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].fiveSecondsIntoVulnerableAimedTS}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].fiveSecondsIntoVulnerableAimedTS / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsWithTS)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                6 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed + (patientSniperPercentPrRank * 6)) / (1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed)) - 1)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].sixSecondsIntoVulnerableAimed}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].sixSecondsIntoVulnerableAimed / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsNoTS)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].sixSecondsIntoVulnerableAimedTS}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].sixSecondsIntoVulnerableAimedTS / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsWithTS)}%</td>
            </tr>
            <th>
            </th>
            <tr style={styles.cellBorder}>
              <td>
                <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} />{'  '}
                outside of <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1) / (1 + this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].vulnerableModifierPiercing)) - 1)}%</td>
              <td>{this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].nonVulnerablePiercingShots}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].nonVulnerablePiercingShots / this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].piercingShotsNoTS)}%</td>
              <td>{this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].nonVulnerablePiercingShotsTS}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].nonVulnerablePiercingShotsTS / this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].piercingShotsWithTS)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} />{'  '}
                0 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].vulnerableModifierPiercing + (patientSniperPercentPrRank * 0)) / (1 + this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].vulnerableModifierPiercing)) - 1)}%</td>
              <td>{this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].zeroSecondsIntoVulnerablePiercing}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].zeroSecondsIntoVulnerablePiercing / this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].piercingShotsNoTS)}%</td>
              <td>{this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].zeroSecondsIntoVulnerablePiercingTS}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].zeroSecondsIntoVulnerablePiercingTS / this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].piercingShotsWithTS)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} />{'  '}
                1 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].vulnerableModifierPiercing + (patientSniperPercentPrRank * 1)) / (1 + this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].vulnerableModifierPiercing)) - 1)}%</td>
              <td>{this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].oneSecondIntoVulnerablePiercing}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].oneSecondIntoVulnerablePiercing / this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].piercingShotsNoTS)}%</td>
              <td>{this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].oneSecondIntoVulnerablePiercingTS}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].oneSecondIntoVulnerablePiercingTS / this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].piercingShotsWithTS)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} />{'  '}
                2 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].vulnerableModifierPiercing + (patientSniperPercentPrRank * 2)) / (1 + this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].vulnerableModifierPiercing)) - 1)}%</td>
              <td>{this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].twoSecondsIntoVulnerablePiercing}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].twoSecondsIntoVulnerablePiercing / this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].piercingShotsNoTS)}%</td>
              <td>{this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].twoSecondsIntoVulnerablePiercingTS}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].twoSecondsIntoVulnerablePiercingTS / this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].piercingShotsWithTS)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} />{'  '}
                3 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].vulnerableModifierPiercing + (patientSniperPercentPrRank * 3)) / (1 + this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].vulnerableModifierPiercing)) - 1)}%</td>
              <td>{this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].threeSecondsIntoVulnerablePiercing}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].threeSecondsIntoVulnerablePiercing / this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].piercingShotsNoTS)}%</td>
              <td>{this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].threeSecondsIntoVulnerablePiercingTS}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].threeSecondsIntoVulnerablePiercingTS / this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].piercingShotsWithTS)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} />{'  '}
                4 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].vulnerableModifierPiercing + (patientSniperPercentPrRank * 4)) / (1 + this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].vulnerableModifierPiercing)) - 1)}%</td>
              <td>{this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].fourSecondsIntoVulnerablePiercing}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].fourSecondsIntoVulnerablePiercing / this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].piercingShotsNoTS)}%</td>
              <td>{this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].fourSecondsIntoVulnerablePiercingTS}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].fourSecondsIntoVulnerablePiercingTS / this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].piercingShotsWithTS)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} />{'  '}
                5 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].vulnerableModifierPiercing + (patientSniperPercentPrRank * 5)) / (1 + this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].vulnerableModifierPiercing)) - 1)}%</td>
              <td>{this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].fiveSecondsIntoVulnerablePiercing}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].fiveSecondsIntoVulnerablePiercing / this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].piercingShotsNoTS)}%</td>
              <td>{this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].fiveSecondsIntoVulnerablePiercingTS}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].fiveSecondsIntoVulnerablePiercingTS / this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].piercingShotsWithTS)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} />{'  '}
                6 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].vulnerableModifierPiercing + (patientSniperPercentPrRank * 6)) / (1 + this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].vulnerableModifierPiercing)) - 1)}%</td>
              <td>{this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].sixSecondsIntoVulnerablePiercing}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].sixSecondsIntoVulnerablePiercing / this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].piercingShotsNoTS)}%</td>
              <td>{this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].sixSecondsIntoVulnerablePiercingTS}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].sixSecondsIntoVulnerablePiercingTS / this.props.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].piercingShotsWithTS)}%</td>
            </tr>
          </tbody>
        </table>
      </div>);
  } else {
      return (
      <div>
        <table className="data-table" style={styles.table}>
          <thead>
            <tr>
              <th><dfn data-tip="The time that has passed since Vulnerable was applied to the target">Time into Vulnerable</dfn></th>
              <th><dfn data-tip="This showcases how much damage your shots gained compared to hitting at 0s passed of Patient Sniper, so this will showcase how much dmg you gained from having the Patient Sniper talent in %">% dmg change</dfn></th>
              <th><dfn data-tip="The amount of casts in this timeframe (0 seconds into vulnerable being 0->0.99 into the vulnerable debuff, 1 sec into vulnerable being 1-1.99 into the debuff etc) when you did NOT have trueshot up">Casts excluding <SpellLink id={SPELLS.TRUESHOT.id} /> </dfn></th>

              <th><dfn data-tip="The percentage of your total casts that hit this specific timeframe">% of total casts excluding <SpellLink id={SPELLS.TRUESHOT.id} /></dfn></th>
              <th><dfn data-tip="The amount of casts in this timeframe (0 seconds into vulnerable being 0->0.99 into the vulnerable debuff, 1 sec into vulnerable being 1-1.99 into the debuff etc) when you DID have trueshot up">Casts including <SpellLink id={SPELLS.TRUESHOT.id} /></dfn></th>
              <th><dfn data-tip="The percentage of your total casts that hit this specific timeframe">% of total casts including <SpellLink id={SPELLS.TRUESHOT.id} /></dfn></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                outside of <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage((1 / (1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed)) - 1)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].nonVulnerableAimedShots}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].nonVulnerableAimedShots / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsNoTS)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].nonVulnerableAimedShotsTS}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].nonVulnerableAimedShotsTS / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsWithTS)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                0 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed + (patientSniperPercentPrRank * 0)) / (1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed)) - 1)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].zeroSecondsIntoVulnerableAimed}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].zeroSecondsIntoVulnerableAimed / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsNoTS)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].nonVulnerableAimedShotsTS}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].nonVulnerableAimedShotsTS / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsWithTS)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                1 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed + (patientSniperPercentPrRank * 1)) / (1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed)) - 1)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].oneSecondIntoVulnerableAimed}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].oneSecondIntoVulnerableAimed / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsNoTS)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].oneSecondIntoVulnerableAimedTS}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].oneSecondIntoVulnerableAimedTS / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsWithTS)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                2 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed + (patientSniperPercentPrRank * 2)) / (1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed)) - 1)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].twoSecondsIntoVulnerableAimed}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].twoSecondsIntoVulnerableAimed / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsNoTS)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].twoSecondsIntoVulnerableAimedTS}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].twoSecondsIntoVulnerableAimedTS / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsWithTS)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                3 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed + (patientSniperPercentPrRank * 3)) / (1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed)) - 1)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].threeSecondsIntoVulnerableAimed}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].threeSecondsIntoVulnerableAimed / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsNoTS)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].threeSecondsIntoVulnerableAimedTS}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].threeSecondsIntoVulnerableAimedTS / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsWithTS)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                4 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed + (patientSniperPercentPrRank * 4)) / (1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed)) - 1)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].fourSecondsIntoVulnerableAimed}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].fourSecondsIntoVulnerableAimed / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsNoTS)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].fourSecondsIntoVulnerableAimedTS}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].fourSecondsIntoVulnerableAimedTS / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsWithTS)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                5 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed + (patientSniperPercentPrRank * 5)) / (1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed)) - 1)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].fiveSecondsIntoVulnerableAimed}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].fiveSecondsIntoVulnerableAimed / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsNoTS)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].fiveSecondsIntoVulnerableAimedTS}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].fiveSecondsIntoVulnerableAimedTS / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsWithTS)}%</td>
            </tr>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                6 sec into <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{formatPercentage(((1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed + (patientSniperPercentPrRank * 6)) / (1 + this.props.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed)) - 1)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].sixSecondsIntoVulnerableAimed}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].sixSecondsIntoVulnerableAimed / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsNoTS)}%</td>
              <td>{this.props.patientSniper[SPELLS.AIMED_SHOT.id].sixSecondsIntoVulnerableAimedTS}</td>
              <td>{formatPercentage(this.props.patientSniper[SPELLS.AIMED_SHOT.id].sixSecondsIntoVulnerableAimedTS / this.props.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsWithTS)}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
    }
  }
}

export default PatientSniperBreakdown;
