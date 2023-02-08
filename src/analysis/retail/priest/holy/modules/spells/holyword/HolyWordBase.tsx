import SpellUsable from 'analysis/retail/priest/holy/modules/features/SpellUsable';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';

const LIGHT_OF_THE_NAARU_REDUCTION_PER_RANK = 0.1;
const HARMONIOUS_APPARATUS_REDUCTION_PER_RANK = 2000;
class HolyWordBase extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  spellId = 0;
  manaCost = 0;
  baseCooldown = 60000;
  apparatusReduction =
    HARMONIOUS_APPARATUS_REDUCTION_PER_RANK *
    this.selectedCombatant.getTalentRank(TALENTS.HARMONIOUS_APPARATUS_TALENT);
  remainingCooldown = 0;
  serendipityProccers: {
    [spellID: string]: {
      baseReduction: () => number;
      lightOfTheNaaruReduction: () => number;
      apotheosisReduction: () => number;
      lightOfTheNaaruAndApotheosisReduction: () => number;
    };
  } = {};
  holyWordHealing = 0;
  holyWordOverhealing = 0;
  holyWordCasts = 0;
  holyWordWastedCooldown = 0;
  baseHolyWordReductionBySpell: { [spellID: string]: number } = {};

  lightOfTheNaruActive = false;
  lightOfTheNaruMultiplier = 1;
  lightOfTheNaruReductionBySpell: { [spellID: string]: number } = {};

  apotheosisCasts = 0;
  apotheosisActive = false;
  apotheosisMultiplier = 3;
  //Not constant because it is used in other holy word files
  apotheosisReductionBySpell: { [spellID: string]: number } = {};
  apotheosisManaReduction = 0;
  holyWordApotheosisCasts = 0;
  holyWordHealingDuringApotheosis = 0;
  holyWordOverhealingDuringApotheosis = 0;

  harmoniousApparatusActive = false;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);

    // Set up proper serendipity reduction values
    if (this.selectedCombatant.hasTalent(TALENTS.LIGHT_OF_THE_NAARU_TALENT)) {
      this.lightOfTheNaruActive = true;
      this.lightOfTheNaruMultiplier =
        this.selectedCombatant.getTalentRank(TALENTS.LIGHT_OF_THE_NAARU_TALENT) *
          LIGHT_OF_THE_NAARU_REDUCTION_PER_RANK +
        1;
    }

    if (this.selectedCombatant.hasTalent(TALENTS.HARMONIOUS_APPARATUS_TALENT)) {
      this.harmoniousApparatusActive = true;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.APOTHEOSIS_TALENT),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.APOTHEOSIS_TALENT),
      this.onRemoveBuff,
    );
  }

  get baseCooldownReduction() {
    let totalCDR = 0;

    for (const key of Object.entries(this.baseHolyWordReductionBySpell)) {
      totalCDR += key[1];
    }
    return totalCDR;
  }

  get lightOfTheNaaruCooldownReduction() {
    let lotnCDR = 0;

    for (const key of Object.entries(this.lightOfTheNaruReductionBySpell)) {
      lotnCDR += key[1];
    }
    return lotnCDR;
  }

  get apotheosisCooldownReduction() {
    let apothCDR = 0;

    for (const key of Object.entries(this.apotheosisReductionBySpell)) {
      apothCDR += key[1];
    }
    return apothCDR;
  }

  get totalHolyWordReductionPerSpell() {
    const totalReduction: any = {};
    for (const [key, value] of Object.entries(this.baseHolyWordReductionBySpell)) {
      totalReduction[key] = totalReduction[key] || 0;
      totalReduction[key] += value;
    }

    for (const [key, value] of Object.entries(this.apotheosisReductionBySpell)) {
      totalReduction[key] = totalReduction[key] || 0;
      totalReduction[key] += value;
    }

    for (const [key, value] of Object.entries(this.lightOfTheNaruReductionBySpell)) {
      totalReduction[key] = totalReduction[key] || 0;
      totalReduction[key] += value;
    }

    return totalReduction;
  }

  get totalHolyWordReductionPerSpellPerTalent() {
    const totalReduction: {
      [spellID: string]: {
        [otherSpellID: string]: number;
      };
    } = {};
    for (const [key, value] of Object.entries(this.baseHolyWordReductionBySpell)) {
      totalReduction[key] = totalReduction[key] || {};
      totalReduction[key].base = totalReduction[key].base || 0;
      totalReduction[key].base += value;
    }

    for (const [key, value] of Object.entries(this.apotheosisReductionBySpell)) {
      totalReduction[key] = totalReduction[key] || {};
      totalReduction[key].apotheosis = totalReduction[key].apotheosis || 0;
      totalReduction[key].apotheosis += value;
    }

    for (const [key, value] of Object.entries(this.lightOfTheNaruReductionBySpell)) {
      totalReduction[key] = totalReduction[key] || {};
      totalReduction[key].lightOfTheNaaru = totalReduction[key].lightOfTheNaaru || 0;
      totalReduction[key].lightOfTheNaaru += value;
    }

    return totalReduction;
  }

  get totalCooldownReduction() {
    return (
      this.baseCooldownReduction +
      this.lightOfTheNaaruCooldownReduction +
      this.apotheosisCooldownReduction
    );
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
    if (this.lightOfTheNaruActive && this.apotheosisActive) {
      //When both LightOfTheNaaru and Apotheosis is active the total reduction is higher than each reduction individually
      //Here each gets reduction equal to their individual contribution and the additional total reduction is split 50%
      //Cooldown gained from harmonious apparatus is treated as being base reduction and thus does not gain any from other bonusses
      const totalReduction =
        this.serendipityProccers[spellId].lightOfTheNaaruAndApotheosisReduction() -
        baseReductionAmount;
      const lightOfTheNaaruReduction =
        this.serendipityProccers[spellId].lightOfTheNaaruReduction() - baseReductionAmount;
      const apotheosisReduction =
        this.serendipityProccers[spellId].apotheosisReduction() - baseReductionAmount;
      const additionalReduction = totalReduction - (lightOfTheNaaruReduction + apotheosisReduction);

      this.lightOfTheNaruReductionBySpell[spellId] =
        this.lightOfTheNaruReductionBySpell[spellId] || 0; //Setting the value to zero if its the first time the spell is cast
      this.apotheosisReductionBySpell[spellId] = this.apotheosisReductionBySpell[spellId] || 0; //Setting the value to zero if its the first time the spell is cast

      this.lightOfTheNaruReductionBySpell[spellId] +=
        lightOfTheNaaruReduction + additionalReduction;
      this.apotheosisReductionBySpell[spellId] += apotheosisReduction + additionalReduction;

      return totalReduction + baseReductionAmount;
    }

    if (this.lightOfTheNaruActive) {
      const lightOfTheNaaruReduction = this.serendipityProccers[spellId].lightOfTheNaaruReduction();
      this.lightOfTheNaruReductionBySpell[spellId] =
        this.lightOfTheNaruReductionBySpell[spellId] || 0; //Setting the value to zero if its the first time the spell is cast
      this.lightOfTheNaruReductionBySpell[spellId] +=
        lightOfTheNaaruReduction - baseReductionAmount;
      return lightOfTheNaaruReduction;
    } else if (this.apotheosisActive) {
      const apotheosisReduction = this.serendipityProccers[spellId].apotheosisReduction();
      this.apotheosisReductionBySpell[spellId] = this.apotheosisReductionBySpell[spellId] || 0; //Setting the value to zero if its the first time the spell is cast
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
