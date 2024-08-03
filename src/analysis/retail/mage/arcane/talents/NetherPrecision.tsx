import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  DamageEvent,
  ApplyBuffEvent,
  RemoveBuffEvent,
  GetRelatedEvent,
  GetRelatedEvents,
} from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';

class NetherPrecision extends Analyzer {
  netherPrecisionBuffs: {
    applied: number;
    removed: number;
    damageEvents?: DamageEvent[];
    overwritten?: boolean;
    usage?: BoxRowEntry;
  }[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.NETHER_PRECISION_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.NETHER_PRECISION_BUFF),
      this.onBuffApply,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onBuffApply(event: ApplyBuffEvent) {
    const removeBuff: RemoveBuffEvent | undefined = GetRelatedEvent(event, 'BuffRemove');
    const damage: DamageEvent[] = GetRelatedEvents(event, 'SpellDamage');
    const missileCast: CastEvent | undefined = GetRelatedEvent(event, 'SpellCast');
    const overwritten =
      missileCast &&
      this.selectedCombatant.hasBuff(SPELLS.NETHER_PORTAL_BUFF.id, missileCast.timestamp);

    this.netherPrecisionBuffs.push({
      applied: event.timestamp,
      removed: removeBuff?.timestamp || this.owner.fight.end_time,
      overwritten: overwritten,
      damageEvents: damage || [],
    });
  }

  onFightEnd() {
    this.analyzeBuffs();
  }

  analyzeBuffs = () => {
    this.netherPrecisionBuffs.forEach((n) => {
      if (n.overwritten) {
        n.usage = { value: QualitativePerformance.Fail, tooltip: `Buff Overwritten` };
      } else if (n.damageEvents?.length === 2) {
        n.usage = { value: QualitativePerformance.Good, tooltip: `Both Stacks Spent` };
      } else if (n.damageEvents?.length === 1) {
        n.usage =
          this.owner.fight.end_time === n.removed
            ? {
                value: QualitativePerformance.Ok,
                tooltip: `Applied within 10s of End of Fight (One Stack Lost)`,
              }
            : { value: QualitativePerformance.Fail, tooltip: `One Stack Lost` };
      } else {
        n.usage =
          this.owner.fight.end_time === n.removed
            ? {
                value: QualitativePerformance.Ok,
                tooltip: `Applied within 10s of End of Fight (Both Stacks Lost)`,
              }
            : { value: QualitativePerformance.Fail, tooltip: `Both Stacks Lost` };
      }
    });
  };

  //ADD STATISTIC
}

export default NetherPrecision;
