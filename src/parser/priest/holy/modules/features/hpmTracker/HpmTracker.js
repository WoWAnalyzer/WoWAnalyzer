import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import ManaTracker from './ManaTracker';
import HealingTracker from 'parser/shared/modules/AbilityTracker';
import Renew from 'parser/priest/holy/modules/spells/Renew';

class HpmTracker extends Analyzer {
  static dependencies = {
    manaTracker: ManaTracker,
    healingTracker: HealingTracker,
    renew: Renew,
  };

  getSpellDetails(spellId) {
    const spellInfo = {};

    spellInfo.spell = SPELLS[spellId];
    spellInfo.casts = this.healingTracker.getAbility(spellId).casts || 0;

    spellInfo.healingHits = this.healingTracker.getAbility(spellId).healingHits || 0;
    spellInfo.healingDone = this.healingTracker.getAbility(spellId).healingEffective || 0;
    spellInfo.overhealingDone = this.healingTracker.getAbility(spellId).healingOverheal || 0;
    spellInfo.healingAbsorbed = this.healingTracker.getAbility(spellId).healingAbsorbed || 0;

    spellInfo.damageHits = this.healingTracker.getAbility(spellId).damageHits || 0;
    spellInfo.damageDone = this.healingTracker.getAbility(spellId).damageEffective || 0;
    spellInfo.damageAbsorbed = this.healingTracker.getAbility(spellId).damageAbsorbed || 0;

    spellInfo.manaSpent = this.manaTracker.spendersObj[spellId] ? this.manaTracker.spendersObj[spellId].spent : 0;
    spellInfo.manaGained = this.manaTracker;

    if (spellId === SPELLS.RENEW.id) {
      return this.getRenewDetails(spellInfo);
    } else if (spellId === SPELLS.PRAYER_OF_MENDING_CAST.id) {
      return this.getPomDetails(spellInfo);
    } else if (spellId === SPELLS.HOLY_WORD_SANCTIFY.id) {
      return this.getSanctifyDetails(spellInfo);
    } else {
      return spellInfo;
    }
  }

  getRenewDetails(spellInfo) {
    // This represents that amount of healing done by HARD CASTING renew.
    // We don't want renew to get Hpm credit for healing that we didn't spend mana on.
    spellInfo.healingDone = this.renew.healingFromRenew(this.renew.renewsCast);
    spellInfo.overhealingDone = this.renew.overhealingFromRenew(this.renew.renewsCast);
    spellInfo.healingAbsorbed = this.renew.absorptionFromRenew(this.renew.renewsCast);

    return spellInfo;
  }

  getPomDetails(spellInfo) {
    return spellInfo;
  }

  getSanctifyDetails(spellInfo) {
    return spellInfo;
  }

  getEnduringRenewalValue() {

  }

  detailsCache;
  get spellDetails() {
    if (this.detailsCache === undefined) {
      this.detailsCache = {
        [SPELLS.GREATER_HEAL.id]: this.getSpellDetails(SPELLS.GREATER_HEAL.id),
        [SPELLS.FLASH_HEAL.id]: this.getSpellDetails(SPELLS.FLASH_HEAL.id),
        [SPELLS.RENEW.id]: this.getSpellDetails(SPELLS.RENEW.id),
        [SPELLS.PRAYER_OF_MENDING_CAST.id]: this.getSpellDetails(SPELLS.PRAYER_OF_MENDING_CAST.id),
        [SPELLS.PRAYER_OF_HEALING.id]: this.getSpellDetails(SPELLS.PRAYER_OF_HEALING.id),
        [SPELLS.GUARDIAN_SPIRIT.id]: this.getSpellDetails(SPELLS.GUARDIAN_SPIRIT.id),
        [SPELLS.DIVINE_HYMN_CAST.id]: this.getSpellDetails(SPELLS.DIVINE_HYMN_CAST.id),
        [SPELLS.HOLY_WORD_SERENITY.id]: this.getSpellDetails(SPELLS.HOLY_WORD_SERENITY.id),
        [SPELLS.HOLY_WORD_SANCTIFY.id]: this.getSpellDetails(SPELLS.HOLY_WORD_SANCTIFY.id),
        [SPELLS.HOLY_WORD_CHASTISE.id]: this.getSpellDetails(SPELLS.HOLY_WORD_CHASTISE.id),
        [SPELLS.HOLY_NOVA.id]: this.getSpellDetails(SPELLS.HOLY_NOVA.id),
        [SPELLS.HOLY_FIRE.id]: this.getSpellDetails(SPELLS.HOLY_FIRE.id),
        [SPELLS.SHACKLE_UNDEAD.id]: this.getSpellDetails(SPELLS.SHACKLE_UNDEAD.id),
        [SPELLS.PURIFY.id]: this.getSpellDetails(SPELLS.PURIFY.id),
        [SPELLS.DISPEL_MAGIC.id]: this.getSpellDetails(SPELLS.DISPEL_MAGIC.id),
        [SPELLS.MASS_DISPEL.id]: this.getSpellDetails(SPELLS.MASS_DISPEL.id),
        [SPELLS.LEAP_OF_FAITH.id]: this.getSpellDetails(SPELLS.LEAP_OF_FAITH.id),
        [SPELLS.PSYCHIC_SCREAM.id]: this.getSpellDetails(SPELLS.PSYCHIC_SCREAM.id),
        [SPELLS.POWER_WORD_FORTITUDE.id]: this.getSpellDetails(SPELLS.POWER_WORD_FORTITUDE.id),
        [SPELLS.MIND_VISION.id]: this.getSpellDetails(SPELLS.MIND_VISION.id),
        [SPELLS.LEVITATE.id]: this.getSpellDetails(SPELLS.LEVITATE.id),
        [SPELLS.MIND_CONTROL.id]: this.getSpellDetails(SPELLS.MIND_CONTROL.id),
        [SPELLS.BINDING_HEAL_TALENT.id]: this.getSpellDetails(SPELLS.BINDING_HEAL_TALENT.id),
        [SPELLS.CIRCLE_OF_HEALING_TALENT.id]: this.getSpellDetails(SPELLS.CIRCLE_OF_HEALING_TALENT.id),
        [SPELLS.HOLY_WORD_SALVATION_TALENT.id]: this.getSpellDetails(SPELLS.HOLY_WORD_SALVATION_TALENT.id),
        [SPELLS.HALO_TALENT.id]: this.getSpellDetails(SPELLS.HALO_TALENT.id),
        [SPELLS.DIVINE_STAR_TALENT.id]: this.getSpellDetails(SPELLS.DIVINE_STAR_TALENT.id),
        [SPELLS.SHINING_FORCE_TALENT.id]: this.getSpellDetails(SPELLS.SHINING_FORCE_TALENT.id),
      }
    }

    return this.detailsCache;
  }

  constructor(...args) {
    super(...args);
    this.resource = RESOURCE_TYPES.MANA;
    this.maxResource = 100000;
  }
}

export default HpmTracker;
