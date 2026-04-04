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
  TALENTS.ADRENALINE_RUSH_TALENT.id,
  SPELLS.BETWEEN_THE_EYES.id,
  SPELLS.SPRINT.id,
  SPELLS.GRAPPLING_HOOK.id,
  TALENTS.BLADE_RUSH_TALENT.id,
  TALENTS.KILLING_SPREE_TALENT.id,
  SPELLS.VANISH.id,
  SPELLS.ROLL_THE_BONES.id,
  TALENTS.KEEP_IT_ROLLING_TALENT.id,
  SPELLS.BLADE_FLURRY.id,
];

const RESTLESS_BLADES_BASE_CDR = 1000;
const TRIPLE_THREAT_CDR = 300;

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
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ROLL_THE_BONES),
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

    const tripleThreatCDR = this.selectedCombatant.hasBuff(SPELLS.TRIPLE_THREAT.id)
      ? TRIPLE_THREAT_CDR
      : 0;

    const cdrAmount = (RESTLESS_BLADES_BASE_CDR + tripleThreatCDR) * spent;

    return cdrAmount;
  }
}

export default RestlessBlades;
