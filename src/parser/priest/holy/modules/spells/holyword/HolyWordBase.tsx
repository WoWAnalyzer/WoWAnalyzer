import SPELLS from 'common/SPELLS/index';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/priest/holy/modules/features/SpellUsable';
import Events, { ApplyBuffEvent, CastEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';

class HolyWordBase extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  spellId = 0;
  manaCost = 0;
  baseCooldown = 60000;
  serendipityReduction = 6000;
  remainingCooldown = 0;
  serendipityProccers: any = {};

  holyWordHealing = 0;
  holyWordOverhealing = 0;
  holyWordCasts = 0;
  holyWordWastedCooldown = 0;

  baseHolyWordReductionBySpell: any = {};

  lightOfTheNaruActive = false;
  lightOfTheNaruMultiplier = 1.333;
  lightOfTheNaruReductionBySpell: any = {};

  apotheosisCasts = 0;
  apotheosisActive = false;
  apotheosisMultiplier = 3;
  apotheosisReductionBySpell: any = {};
  apotheosisManaReduction = 0;
  holyWordApotheosisCasts = 0;
  holyWordHealingDuringApotheosis = 0;
  holyWordOverhealingDuringApotheosis = 0;

  get baseCooldownReduction() {
    let totalCDR = 0;

    for (const spellID in this.baseHolyWordReductionBySpell) {
      totalCDR += this.baseHolyWordReductionBySpell[spellID];
    }
    return totalCDR;
  }

  get lightOfTheNaaruCooldownReduction() {
    let lotnCDR = 0;

    for (const spellID in this.lightOfTheNaruReductionBySpell) {
      lotnCDR += this.lightOfTheNaruReductionBySpell[spellID];
    }
    return lotnCDR;
  }

  get apotheosisCooldownReduction() {
    let apothCDR = 0;

    for (const spellID in this.apotheosisReductionBySpell) {
      apothCDR += this.apotheosisReductionBySpell[spellID];
    }
    return apothCDR;
  }

  get totalHolyWordReductionPerSpell() {
    const totalReduction: any = {};
    for (const key in this.baseHolyWordReductionBySpell) {
      totalReduction[key] = totalReduction[key] || 0;
      totalReduction[key] += this.baseHolyWordReductionBySpell[key];
    }

    for (const key in this.apotheosisReductionBySpell) {
      totalReduction[key] = totalReduction[key] || 0;
      totalReduction[key] += this.apotheosisReductionBySpell[key];
    }

    for (const key in this.lightOfTheNaruReductionBySpell) {
      totalReduction[key] = totalReduction[key] || 0;
      totalReduction[key] += this.lightOfTheNaruReductionBySpell[key];
    }

    return totalReduction;
  }

  get totalHolyWordReductionPerSpellPerTalent() {
    const totalReduction: any = {};
    for (const key in this.baseHolyWordReductionBySpell) {
      totalReduction[key] = totalReduction[key] || {};
      totalReduction[key].base = totalReduction[key].base || 0;
      totalReduction[key].base += this.baseHolyWordReductionBySpell[key];
    }

    for (const key in this.apotheosisReductionBySpell) {
      totalReduction[key] = totalReduction[key] || {};
      totalReduction[key].apotheosis = totalReduction[key].apotheosis || 0;
      totalReduction[key].apotheosis += this.apotheosisReductionBySpell[key];
    }

    for (const key in this.lightOfTheNaruReductionBySpell) {
      totalReduction[key] = totalReduction[key] || {};
      totalReduction[key].lightOfTheNaaru = totalReduction[key].lightOfTheNaaru || 0;
      totalReduction[key].lightOfTheNaaru += this.lightOfTheNaruReductionBySpell[key];
    }

    return totalReduction;
  }

  get totalCooldownReduction() {
    return this.baseCooldownReduction + this.lightOfTheNaaruCooldownReduction + this.apotheosisCooldownReduction;
  }

  constructor(options: Options) {
    super(options);

    // Set up proper serendipity reduction values
    if (this.selectedCombatant.hasTalent(SPELLS.LIGHT_OF_THE_NAARU_TALENT.id)) {
      this.lightOfTheNaruActive = true;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.APOTHEOSIS_TALENT), this.onApplyBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.APOTHEOSIS_TALENT), this.onRemoveBuff);
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId === this.spellId) {
      this.holyWordCasts += 1;
      this.remainingCooldown = this.baseCooldown;

      if (this.apotheosisActive) {
        this.apotheosisManaReduction += this.manaCost;
        this.holyWordApotheosisCasts += 1;
      }

    } else if (this.serendipityProccers[spellId] != null) {
      const reductionAmount = this.parseSerendipityCast(spellId);
      this.remainingCooldown -= reductionAmount;

      if (this.spellUsable.isOnCooldown(this.spellId)) {
        this.spellUsable.reduceCooldown(this.spellId, reductionAmount, event.timestamp);
      }

      if (this.remainingCooldown < 0) {
        this.holyWordWastedCooldown += this.remainingCooldown * -1;
        this.remainingCooldown = 0;
      }
    }
  }

  parseSerendipityCast(spellId: number) {
    // We are casting a spell that will reduce a Holy Word Cooldown.
    // Get the base amount of the reduction
    const baseReductionAmount = this.serendipityProccers[spellId].baseReduction();
    this.baseHolyWordReductionBySpell[spellId] = this.baseHolyWordReductionBySpell[spellId] || 0;
    this.baseHolyWordReductionBySpell[spellId] += baseReductionAmount;

    // Get the modified reduction by spell
    if (this.lightOfTheNaruActive) {
      const lightOfTheNaaruReduction = this.serendipityProccers[spellId].lightOfTheNaaruReduction();
      this.lightOfTheNaruReductionBySpell[spellId] = this.lightOfTheNaruReductionBySpell[spellId] || 0;
      this.lightOfTheNaruReductionBySpell[spellId] += lightOfTheNaaruReduction - baseReductionAmount;
      return lightOfTheNaaruReduction;
    } else if (this.apotheosisActive) {
      const apotheosisReduction = this.serendipityProccers[spellId].apotheosisReduction();
      this.apotheosisReductionBySpell[spellId] = this.apotheosisReductionBySpell[spellId] || 0;
      this.apotheosisReductionBySpell[spellId] += apotheosisReduction - baseReductionAmount;
      return apotheosisReduction;
    } else {
      return baseReductionAmount;
    }
  }

  onHeal(event: HealEvent) {
    const spellId = event.ability.guid;
    if (spellId === this.spellId) {
      this.holyWordHealing += event.amount || 0;
      this.holyWordOverhealing += event.overheal || 0;

      if (this.apotheosisActive) {
        this.holyWordHealingDuringApotheosis += event.amount || 0;
        this.holyWordOverhealingDuringApotheosis += event.overheal || 0;
      }
    }
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.apotheosisCasts += 1;
    this.apotheosisActive = true;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.apotheosisActive = false;
  }
}

export default HolyWordBase;
