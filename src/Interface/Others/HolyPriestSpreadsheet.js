import React from 'react';
import PropTypes from 'prop-types';
import SPELLS from 'common/SPELLS';

class HolyPriestSpreadsheet extends React.Component {
  static propTypes = {
    parser: PropTypes.object.isRequired,
  };

  render() {
    const { parser } = this.props;

    const styles = {
      cellBorder: { borderTop: '.5px solid #dddddd' },
      table: { borderBottom: '1px solid #dddddd', borderTop: '1px solid #dddddd', align: 'left', padding: '8px', float: 'left', margin: '2px' },
    };

    const getAbility = spellId => parser._modules.abilityTracker.getAbility(spellId);

    const overhealingSpell = spellId => ((getAbility(spellId).healingOverheal || 0) / ((getAbility(spellId).healingOverheal || 0) + (getAbility(spellId).healingEffective || 0)) || 0).toFixed(5);

    const cpm = spellId => (getAbility(spellId).casts / Math.floor(parser.fightDuration / 1000 / 60) || 0).toFixed(5);

    const targetsPerCast = (spellId, healId) => {
      const ability = getAbility(spellId);
      const heal = healId === undefined ? getAbility(spellId) : getAbility(healId);

      if (ability.ability == null) {
        return 'N/A';
      }

      let count = heal.healingHits / ability.casts;
      if (count) {
        return count.toFixed(5);
      }

      return JSON.stringify([ability, heal]);
    };

    const castEfficiency = (spellId) => {
      const efficiency = parser._modules.CastEfficiency.getCastEfficiencyForSpellId(spellId, true);
      if (!efficiency) {
        return 'N/A';
      }
      else if (efficiency.efficiency) {
        return efficiency.efficiency.toFixed(5);
      }
      else if (efficiency.maxCasts !== Infinity){
        return '0.00';
      } else {
        return 1;
      }
    };

    return (

      <div>
        <div style={{ padding: '0px 22px 15px 0px' }}>Please use the below table to populate the Player Log section of the Holy Priest Spreadsheet by Niphyr. <a href="http://www.peakofserenity.com/mistweaver/spreadsheet/" target="_blank" rel="noopener noreferrer">Link to the sheet</a><br /></div>
        <div>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td>Intellect Rating</td>
                <td>{parser.selectedCombatant._combatantInfo.intellect}</td>
              </tr>
              <tr>
                <td>Critical Strike Rating</td>
                <td>{parser.selectedCombatant._combatantInfo.critSpell}</td>
              </tr>
              <tr>
                <td>Haste Rating</td>
                <td>{parser.selectedCombatant._combatantInfo.hasteSpell}</td>
              </tr>
              <tr>
                <td>Mastery Rating</td>
                <td>{parser.selectedCombatant._combatantInfo.mastery}</td>
              </tr>
              <tr>
                <td>Versatility Rating</td>
                <td>{parser.selectedCombatant._combatantInfo.versatilityHealingDone}</td>
              </tr>
              <tr>
                <td>Fight Length</td>
                <td>{Math.floor(parser.fightDuration / 1000)}</td>
              </tr>
              <tr>
                <td>Total Healing from Azerite Traits</td>
                <td></td>
              </tr>
              <tr>
                <td>Renews refreshed by Enduring Renewal</td>
                <td></td>
              </tr>
              <tr>
                <td>Renews from benediction</td>
                <td></td>
              </tr>
            </tbody>
          </table>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td>Spell Name</td>
                <td>Overheal %</td>
                <td>CPM</td>
                <td>Casting Efficiency %</td>
                <td>Average Targets / Cast</td>
              </tr>
              <tr>
                <td>Heal</td>
                <td>{overhealingSpell(SPELLS.GREATER_HEAL.id)}</td>
                <td>{cpm(SPELLS.GREATER_HEAL.id)}</td>
                <td>{castEfficiency(SPELLS.GREATER_HEAL.id)}</td>
                <td>{targetsPerCast(SPELLS.GREATER_HEAL.id)}</td>
              </tr>
              <tr>
                <td>Flash Heal</td>
                <td>{overhealingSpell(SPELLS.FLASH_HEAL.id)}</td>
                <td>{cpm(SPELLS.FLASH_HEAL.id)}</td>
                <td>{castEfficiency(SPELLS.FLASH_HEAL.id)}</td>
                <td>{targetsPerCast(SPELLS.FLASH_HEAL.id)}</td>
              </tr>
              <tr>
                <td>Renew</td>
                <td>{overhealingSpell(SPELLS.RENEW.id)}</td>
                <td>{cpm(SPELLS.RENEW.id)}</td>
                <td>{castEfficiency(SPELLS.RENEW.id)}</td>
                <td>{targetsPerCast(SPELLS.RENEW.id)}</td>
              </tr>
              <tr>
                <td>Prayer of Healing</td>
                <td>{overhealingSpell(SPELLS.PRAYER_OF_HEALING.id)}</td>
                <td>{cpm(SPELLS.PRAYER_OF_HEALING.id)}</td>
                <td>{castEfficiency(SPELLS.PRAYER_OF_HEALING.id)}</td>
                <td>{targetsPerCast(SPELLS.PRAYER_OF_HEALING.id)}</td>
              </tr>
              <tr>
                <td>Prayer of Mending</td>
                <td>{overhealingSpell(SPELLS.PRAYER_OF_MENDING_HEAL.id)}</td>
                <td>{cpm(SPELLS.PRAYER_OF_MENDING_CAST.id)}</td>
                <td>{castEfficiency(SPELLS.PRAYER_OF_MENDING_CAST.id)}</td>
                <td>{targetsPerCast(SPELLS.PRAYER_OF_MENDING_CAST.id, SPELLS.PRAYER_OF_MENDING_HEAL.id)}</td>
              </tr>
              <tr>
                <td>Holy Word: Serenity</td>
                <td>{overhealingSpell(SPELLS.HOLY_WORD_SERENITY.id)}</td>
                <td>{cpm(SPELLS.HOLY_WORD_SERENITY.id)}</td>
                <td>{castEfficiency(SPELLS.HOLY_WORD_SERENITY.id)}</td>
                <td>{targetsPerCast(SPELLS.HOLY_WORD_SERENITY.id)}</td>
              </tr>
              <tr>
                <td>Holy Word: Sanctify</td>
                <td>{overhealingSpell(SPELLS.HOLY_WORD_SANCTIFY.id)}</td>
                <td>{(getAbility(SPELLS.HOLY_WORD_SANCTIFY.id).healingHits / Math.floor(parser.fightDuration / 1000 / 60) || 0).toFixed(5)}</td>
                <td>{castEfficiency(SPELLS.HOLY_WORD_SANCTIFY.id)}</td>
                <td>{targetsPerCast(SPELLS.HOLY_WORD_SANCTIFY.id)}</td>
              </tr>
              <tr>
                <td>Guardian Spirit</td>
                <td>{overhealingSpell(SPELLS.GUARDIAN_SPIRIT.id)}</td>
                <td>{cpm(SPELLS.GUARDIAN_SPIRIT.id)}</td>
                <td>{castEfficiency(SPELLS.GUARDIAN_SPIRIT.id)}</td>
                <td>1</td>
              </tr>
              <tr>
                <td>Divine Hymn</td>
                <td>{overhealingSpell(SPELLS.DIVINE_HYMN_HEAL.id)}</td>
                <td>{cpm(SPELLS.DIVINE_HYMN_CAST.id)}</td>
                <td>{castEfficiency(SPELLS.DIVINE_HYMN_CAST.id)}</td>
                <td>{targetsPerCast(SPELLS.DIVINE_HYMN_CAST.id, SPELLS.DIVINE_HYMN_HEAL.id)}</td>
              </tr>
              <tr>
                <td>Desperate Prayer</td>
                <td>{overhealingSpell(SPELLS.DESPERATE_PRAYER.id)}</td>
                <td>{cpm(SPELLS.DESPERATE_PRAYER.id)}</td>
                <td>{castEfficiency(SPELLS.DESPERATE_PRAYER.id)}</td>
                <td>1</td>
              </tr>

              <tr>
                <td>Cosmic Ripple</td>
                <td>{overhealingSpell(SPELLS.COSMIC_RIPPLE_HEAL.id)}</td>
                <td>N/A</td>
                <td>N/A</td>
                <td>N/A</td>
              </tr>
              <tr>
                <td>Binding Heal</td>
                <td>{overhealingSpell(SPELLS.BINDING_HEAL_TALENT.id)}</td>
                <td>{cpm(SPELLS.BINDING_HEAL_TALENT.id)}</td>
                <td>{castEfficiency(SPELLS.BINDING_HEAL_TALENT.id)}</td>
                <td>{targetsPerCast(SPELLS.BINDING_HEAL_TALENT.id)}</td>
              </tr>
              <tr>
                <td>Circle of Healing</td>
                <td>{overhealingSpell(SPELLS.CIRCLE_OF_HEALING_TALENT.id)}</td>
                <td>{cpm(SPELLS.CIRCLE_OF_HEALING_TALENT.id)}</td>
                <td>{castEfficiency(SPELLS.CIRCLE_OF_HEALING_TALENT.id)}</td>
                <td>{targetsPerCast(SPELLS.CIRCLE_OF_HEALING_TALENT.id)}</td>
              </tr>
              <tr>
                <td>Divine Star</td>
                <td>{overhealingSpell(SPELLS.DIVINE_STAR_TALENT.id)}</td>
                <td>{cpm(SPELLS.DIVINE_STAR_TALENT.id)}</td>
                <td>{castEfficiency(SPELLS.DIVINE_STAR_TALENT.id)}</td>
                <td>{targetsPerCast(SPELLS.DIVINE_STAR_TALENT.id)}</td>
              </tr>
              <tr>
                <td>Halo</td>
                <td>{overhealingSpell(SPELLS.HALO_TALENT.id)}</td>
                <td>{cpm(SPELLS.HALO_TALENT.id)}</td>
                <td>{castEfficiency(SPELLS.HALO_TALENT.id)}</td>
                <td>{targetsPerCast(SPELLS.HALO_TALENT.id)}</td>
              </tr>
              <tr>
                <td>Holy Word: Salvation</td>
                <td>{overhealingSpell(SPELLS.HOLY_WORD_SALVATION_TALENT.id)}</td>
                <td>{cpm(SPELLS.HOLY_WORD_SALVATION_TALENT.id)}</td>
                <td>{castEfficiency(SPELLS.HOLY_WORD_SALVATION_TALENT.id)}</td>
                <td>{targetsPerCast(SPELLS.HOLY_WORD_SALVATION_TALENT.id)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default HolyPriestSpreadsheet;
