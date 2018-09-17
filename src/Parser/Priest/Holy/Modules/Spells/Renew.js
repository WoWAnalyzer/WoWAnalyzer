import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

import { ABILITIES_THAT_TRIGGER_ENDURING_RENEWAL } from '../../Constants';

class Renew extends Analyzer {
  totalRenewHealing = 0;
  totalRenewOverhealing = 0;

  renewsCast = 0;
  totalRenewApplications = 0;

  renewsFromBenedictionAndRenew = 0;
  renewsFromEnduringRenewal = 0;
  renewsFromSalv = 0;

  lastSalvationCast = 0;
  lastErSpellCast = 0;

  get renewsFromBenediction() {
    return this.renewsFromBenedictionAndRenew - this.renewsCast;
  }

  healingFromRenew(renewCount) {
    const averageHealingPerRenewApplication = this.totalRenewHealing / this.totalRenewApplications;
    return averageHealingPerRenewApplication * renewCount;
  }

  overhealingFromRenew(renewCount) {
    const averageOverHealingPerRenewApplication = this.totalRenewOverhealing / this.totalRenewApplications;
    return averageOverHealingPerRenewApplication * renewCount;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.RENEW.id) {
      this.totalRenewHealing += event.amount || 0;
      this.totalRenewOverhealing += event.overheal || 0;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.RENEW.id) {
      this.renewsCast++;
    }
    else if (spellId === SPELLS.HOLY_WORD_SALVATION_TALENT.id) {
      this.lastSalvationCast = event.timestamp;
    }
    else if (ABILITIES_THAT_TRIGGER_ENDURING_RENEWAL.includes(spellId)) {
      this.lastErSpellCast = event.timestamp;
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.RENEW.id) {
      this.totalRenewApplications++;

      if (event.timestamp - this.lastSalvationCast < 100) {
        this.renewsFromSalv++;
      }
      else if (event.timestamp - this.lastErSpellCast < 100) {
        this.renewsFromEnduringRenewal++;
      } else {
        this.renewsFromBenedictionAndRenew++;
      }
    }
  }
}

export default Renew;
