import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { SpendResourceEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import TALENTS from 'common/TALENTS/rogue';

/**
 * Restless Blades
 * Finishing moves reduce the remaining cooldown of the abilities listed below by 1 sec per combo point spent.
 */
const AFFECTED_ABILITIES: number[] = [
  SPELLS.VANISH.id,
  SPELLS.SPRINT.id,
  SPELLS.BLADE_FLURRY.id,
  SPELLS.ROLL_THE_BONES.id,
  SPELLS.GRAPPLING_HOOK.id,
  SPELLS.BETWEEN_THE_EYES.id,
  TALENTS.BLADE_RUSH_TALENT.id,
  TALENTS.KILLING_SPREE_TALENT.id,
  TALENTS.KEEP_IT_ROLLING_TALENT.id,
  TALENTS.ADRENALINE_RUSH_TALENT.id,
];

const RESTLESS_BLADES_BASE_CDR = 1000;
const DRAGONBONE_DICE_MOD = 0.1;
const TRIPLE_THREAT_CDR = 1.3;

const SUPER_CHARGED_COMBO_POINT_WORTH = 2;
const FORCED_INDUCTION_COMBO_POINT_WORTH = 1;
const COUP_DE_GRACE_EXTRA_COMBO_POINT_WORTH = 5;

class RestlessBlades extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  hasSuperCharger = this.selectedCombatant.hasTalent(TALENTS.SUPERCHARGER_TALENT);
  hasForcedInduction = this.selectedCombatant.hasTalent(TALENTS.FORCED_INDUCTION_TALENT);

  currentSuperChargedComboPoints = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.SpendResource.by(SELECTED_PLAYER), this.onSpendResource);

    if (this.hasSuperCharger) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ADRENALINE_RUSH_TALENT),
        this.onCast,
      );
    }
  }

  private onCast() {
    this.currentSuperChargedComboPoints = 2;
  }

  private useSuperChargedComboPoint() {
    if (this.currentSuperChargedComboPoints === 0) {
      return 0;
    }

    this.currentSuperChargedComboPoints -= 1;

    return (
      SUPER_CHARGED_COMBO_POINT_WORTH +
      (this.hasForcedInduction ? FORCED_INDUCTION_COMBO_POINT_WORTH : 0)
    );
  }

  private onSpendResource(event: SpendResourceEvent) {
    if (event.resourceChangeType !== RESOURCE_TYPES.COMBO_POINTS.id) {
      return;
    }

    let spent = (event.resourceChange += this.useSuperChargedComboPoint());
    if (event.ability.guid === SPELLS.COUP_DE_GRACE_CAST.id) {
      spent += COUP_DE_GRACE_EXTRA_COMBO_POINT_WORTH;
    }

    const hasRollTheBonesCDR =
      this.selectedCombatant.hasBuff(SPELLS.TRIPLE_THREAT.id) ||
      this.selectedCombatant.hasBuff(SPELLS.JACKPOT.id);
    const hasDragonboneDice = this.selectedCombatant.hasTalent(TALENTS.DRAGON_BONE_DICE_TALENT);

    let cdrAmount = RESTLESS_BLADES_BASE_CDR * spent;

    if (hasRollTheBonesCDR) {
      hasDragonboneDice
        ? (cdrAmount = cdrAmount * (TRIPLE_THREAT_CDR + DRAGONBONE_DICE_MOD))
        : (cdrAmount = cdrAmount * TRIPLE_THREAT_CDR);
    }

    AFFECTED_ABILITIES.forEach((spell) => this.reduceCooldown(spell, cdrAmount));

    return cdrAmount;
  }

  private reduceCooldown(spellId: number, amount: number) {
    if (this.spellUsable.isOnCooldown(spellId)) {
      this.spellUsable.reduceCooldown(spellId, amount);
    }
  }
}

export default RestlessBlades;
