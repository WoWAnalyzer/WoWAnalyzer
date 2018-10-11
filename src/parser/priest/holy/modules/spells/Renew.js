import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';

import { ABILITIES_THAT_TRIGGER_ENDURING_RENEWAL } from '../../constants';

const MS_BUFFER = 100;

class Renew extends Analyzer {
  totalRenewHealing = 0;
  totalRenewOverhealing = 0;
  totalRenewAbsorbs = 0;

  renewsCast = 0;
  totalRenewApplications = 0;

  salvationActive = false;
  lastSalvationCast = 0;
  renewsFromSalvation = 0;

  enduringRenewalActive = false;
  lastEnduringRenewalSpellCast = 0;
  renewsFromEnduringRenewal = 0;

  benedictionActive = false;
  renewsFromBenedictionAndRenew = 0;

  constructor(...args) {
    super(...args);

    if (this.selectedCombatant.hasTalent(SPELLS.HOLY_WORD_SALVATION_TALENT.id)) {
      this.salvationActive = true;
    }
    if (this.selectedCombatant.hasTalent(SPELLS.ENDURING_RENEWAL_TALENT.id)) {
      this.enduringRenewalEnabled = true;
    }
    if (this.selectedCombatant.hasTalent(SPELLS.BENEDICTION_TALENT.id)) {
      this.benedictionActive = true;
    }
  }

  get renewsFromBenediction() {
    return this.renewsFromBenedictionAndRenew - this.renewsCast;
  }

  healingFromRenew(applicationCount) {
    const averageHealingPerRenewApplication = this.totalRenewHealing / this.totalRenewApplications;
    return averageHealingPerRenewApplication * applicationCount;
  }

  overhealingFromRenew(applicationCount) {
    const averageOverHealingPerRenewApplication = this.totalRenewOverhealing / this.totalRenewApplications;
    return averageOverHealingPerRenewApplication * applicationCount;
  }

  absorptionFromRenew(applicationCount) {
    const averageAbsorptionPerRenewApplication = this.totalRenewOverhealing / this.totalRenewApplications;
    return averageAbsorptionPerRenewApplication * applicationCount;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.RENEW.id) {
      this.totalRenewHealing += event.amount || 0;
      this.totalRenewOverhealing += event.overheal || 0;
      this.totalRenewAbsorbs += event.absorbed || 0;
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
      this.lastEnduringRenewalSpellCast = event.timestamp;
    }
  }

  on_byPlayer_applybuff(event) {
    this.handleRenewApplication(event);
  }

  on_byPlayer_refreshbuff(event) {
    this.handleRenewApplication(event);
  }

  handleRenewApplication(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.RENEW.id) {
      return;
    }

    this.totalRenewApplications++;

    if (this.salvationActive && event.timestamp - this.lastSalvationCast < MS_BUFFER) {
      this.renewsFromSalvation++;
    }
    else if (this.enduringRenewalActive && event.timestamp - this.lastEnduringRenewalSpellCast < MS_BUFFER) {
      this.renewsFromEnduringRenewal++;
    }
    else {
      this.renewsFromBenedictionAndRenew++;
    }
  }
}

export default Renew;
