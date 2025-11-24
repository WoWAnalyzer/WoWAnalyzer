import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import ArcaneChargeTracker from '../core/ArcaneChargeTracker';
import { getManaPercentage } from '../../shared/helpers';

export default class ArcaneSurge extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    chargeTracker: ArcaneChargeTracker,
  };
  protected abilityTracker!: AbilityTracker;
  protected chargeTracker!: ArcaneChargeTracker;

  hasSiphonStorm: boolean = this.selectedCombatant.hasTalent(TALENTS.EVOCATION_TALENT);

  surgeData: ArcaneSurgeData[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ARCANE_SURGE_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ARCANE_SURGE_TALENT),
      this.onSurgeCast,
    );
  }

  onSurgeCast(event: CastEvent) {
    this.surgeData.push({
      cast: event.timestamp,
      charges: this.chargeTracker.current,
      siphonStormBuff: this.selectedCombatant.hasBuff(SPELLS.SIPHON_STORM_BUFF.id),
      mana: getManaPercentage(event),
    });
  }

  get averageManaPercent() {
    let manaPercentTotal = 0;
    this.surgeData.forEach((s) => (manaPercentTotal += s.mana || 0));
    return manaPercentTotal / this.abilityTracker.getAbility(TALENTS.ARCANE_SURGE_TALENT.id).casts;
  }

  get arcaneSurgeManaThresholds() {
    return {
      actual: this.averageManaPercent,
      isLessThan: {
        minor: 0.98,
        average: 0.95,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export interface ArcaneSurgeData {
  cast: number;
  mana?: number;
  charges: number;
  siphonStormBuff: boolean;
}
