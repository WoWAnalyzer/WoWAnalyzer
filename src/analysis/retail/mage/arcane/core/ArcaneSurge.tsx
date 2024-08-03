import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ThresholdStyle } from 'parser/core/ParseResults';

const MANA_THRESHOLD = 0.95;

class ArcaneSurge extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  hasSiphonStorm: boolean = this.selectedCombatant.hasTalent(TALENTS.EVOCATION_TALENT);
  hasNetherPrecision: boolean = this.selectedCombatant.hasTalent(TALENTS.NETHER_PRECISION_TALENT);

  surgeCasts: {
    cast: number;
    mana?: number;
    siphonStormBuff: boolean;
    netherPrecision: boolean;
    usage?: BoxRowEntry;
  }[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ARCANE_SURGE_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ARCANE_SURGE_TALENT),
      this.onSurgeCast,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onSurgeCast(event: CastEvent) {
    const resource = event.classResources?.find(
      (resource) => resource.type === RESOURCE_TYPES.MANA.id,
    );
    const manaPercent = resource && resource.amount / resource.max;
    const siphonStorm = this.selectedCombatant.hasBuff(SPELLS.SIPHON_STORM_BUFF.id);
    const netherPrecision = this.selectedCombatant.hasBuff(SPELLS.NETHER_PRECISION_BUFF.id);

    this.surgeCasts.push({
      cast: event.timestamp,
      mana: manaPercent,
      siphonStormBuff: siphonStorm,
      netherPrecision: netherPrecision,
    });
  }

  onFightEnd() {
    this.analyzeSurge();
  }

  analyzeSurge = () => {
    this.surgeCasts.forEach((s) => {
      if (s.mana && s.mana < MANA_THRESHOLD) {
        s.usage = {
          value: QualitativePerformance.Fail,
          tooltip: `Player was low on mana (${formatPercentage(s.mana)}).`,
        };
      } else if (this.hasSiphonStorm && !s.siphonStormBuff) {
        s.usage = { value: QualitativePerformance.Fail, tooltip: `Siphon Storm buff not found.` };
      } else if (this.hasNetherPrecision && !s.netherPrecision) {
        s.usage = {
          value: QualitativePerformance.Fail,
          tooltip: `Nether Precision buff not found.`,
        };
      } else {
        s.usage = { value: QualitativePerformance.Good, tooltip: `Good Arcane Surge cast.` };
      }
    });
  };

  get averageManaPercent() {
    let manaPercentTotal = 0;
    this.surgeCasts.forEach((s) => (manaPercentTotal += s.mana || 0));
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

export default ArcaneSurge;
