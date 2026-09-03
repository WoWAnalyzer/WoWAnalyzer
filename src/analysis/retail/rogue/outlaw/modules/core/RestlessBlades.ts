import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { SpendResourceEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import TALENTS from 'common/TALENTS/rogue';
import { ROLL_THE_BONES_CDR_STAGE, rollTheBonesStage } from '../../constants';

/**
 * Restless Blades
 * Finishing moves reduce the remaining cooldown of the abilities listed below by 1 sec per combo point spent.
 */
// Exactly the Restless Blades tooltip list; Vanish and Preparation are not affected.
const AFFECTED_ABILITIES: number[] = [
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

/** SimC's `trigger_restless_blades`. It declares Dragon-Bone Dice but never applies it. */
const RESTLESS_BLADES_BASE_CDR = 1000;
const ROLL_THE_BONES_CDR_MULTIPLIER = 1.3;

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
  // Supercharger has two ranks, each charging one additional combo point.
  superChargedComboPointsPerCast = this.selectedCombatant.getTalentRank(
    TALENTS.SUPERCHARGER_TALENT,
  );

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
    this.currentSuperChargedComboPoints = this.superChargedComboPointsPerCast;
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

    // Do not mutate `event.resourceChange` — later listeners on this event, notably FinisherTracker,
    // read it and would see an inflated value.
    let spent = event.resourceChange + this.useSuperChargedComboPoint();
    if (event.ability.guid === SPELLS.COUP_DE_GRACE_CAST.id) {
      spent += COUP_DE_GRACE_EXTRA_COMBO_POINT_WORTH;
    }

    let cdrAmount = RESTLESS_BLADES_BASE_CDR * spent;

    if (rollTheBonesStage(this.selectedCombatant, event.timestamp) >= ROLL_THE_BONES_CDR_STAGE) {
      cdrAmount *= ROLL_THE_BONES_CDR_MULTIPLIER;
    }

    AFFECTED_ABILITIES.forEach((spell) => this.reduceCooldown(spell, cdrAmount));
  }

  private reduceCooldown(spellId: number, amount: number) {
    if (this.spellUsable.isOnCooldown(spellId)) {
      this.spellUsable.reduceCooldown(spellId, amount);
    }
  }
}

export default RestlessBlades;
