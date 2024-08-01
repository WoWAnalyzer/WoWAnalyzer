import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, {
  DamageEvent,
  ApplyBuffEvent,
  RemoveBuffEvent,
  GetRelatedEvent,
} from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';

class SiphonStorm extends Analyzer {
  siphonStormBuffs: {
    applied: number;
    removed: number;
    arcaneSurge?: DamageEvent;
    usage?: BoxRowEntry;
  }[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.EVOCATION_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SIPHON_STORM_BUFF),
      this.onBuffApply,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onBuffApply(event: ApplyBuffEvent) {
    const removeBuff: RemoveBuffEvent | undefined = GetRelatedEvent(event, 'BuffRemove');
    const arcaneSurge: DamageEvent | undefined = GetRelatedEvent(event, 'SpellDamage');

    this.siphonStormBuffs.push({
      applied: event.timestamp,
      removed: removeBuff?.timestamp || this.owner.fight.end_time,
      arcaneSurge: arcaneSurge,
    });
  }

  onFightEnd() {
    this.analyzeBuffs();
  }

  analyzeBuffs = () => {
    this.siphonStormBuffs.forEach((s) => {
      if (s.arcaneSurge) {
        s.usage = {
          value: QualitativePerformance.Good,
          tooltip: `Arcane Surge buffed by Siphon Storm`,
        };
      } else {
        s.usage = { value: QualitativePerformance.Fail, tooltip: `No Arcane Surge cast found` };
      }
    });
  };
}

export default SiphonStorm;
