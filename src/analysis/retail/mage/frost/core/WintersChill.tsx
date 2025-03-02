import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyDebuffEvent,
  RefreshDebuffEvent,
  CastEvent,
  DamageEvent,
  GetRelatedEvent,
  RemoveDebuffEvent,
  GetRelatedEvents,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

const STACK_SPENDERS = [
  SPELLS.FROSTBOLT_DAMAGE.id,
  SPELLS.FROSTFIRE_BOLT_DAMAGE.id,
  SPELLS.GLACIAL_SPIKE_DAMAGE.id,
  SPELLS.ICE_LANCE_DAMAGE.id,
  SPELLS.COMET_STORM_DAMAGE.id,
  TALENTS.RAY_OF_FROST_TALENT.id,
  TALENTS.ICE_NOVA_TALENT.id,
];

const FREE_SPENDERS = [SPELLS.COMET_STORM_DAMAGE.id, TALENTS.RAY_OF_FROST_TALENT.id];

export interface WintersChillStacks {
  spellId: number;
  stacks: number;
  hits: number;
}
export default class WintersChill extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  hasRayOfFrost: boolean = this.selectedCombatant.hasTalent(TALENTS.RAY_OF_FROST_TALENT);
  hasGlacialSpike: boolean = this.selectedCombatant.hasTalent(TALENTS.GLACIAL_SPIKE_TALENT);
  hasCometStorm: boolean = this.selectedCombatant.hasTalent(TALENTS.COMET_STORM_TALENT);

  chillDebuffs: WintersChillDebuff[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.WINTERS_CHILL),
      this.onWintersChill,
    );
  }

  onWintersChill(event: ApplyDebuffEvent) {
    const refreshes: RefreshDebuffEvent[] = GetRelatedEvents(event, 'DebuffRefresh') || [];
    const remove: RemoveDebuffEvent | undefined = GetRelatedEvent(event, 'DebuffRemove');
    const flurryCast: CastEvent | undefined = GetRelatedEvent(event, 'SpellCast');
    const precast: CastEvent | undefined = GetRelatedEvent(event, 'PreCast');
    const damage: DamageEvent[] = GetRelatedEvents(event, 'SpellDamage') || [];
    const spenders = damage.filter((d) => {
      const precastDamage = precast && GetRelatedEvent(precast, 'SpellDamage');
      if (
        STACK_SPENDERS.includes(d.ability.guid) &&
        (!precastDamage || precastDamage.timestamp !== d.timestamp)
      ) {
        return true;
      } else {
        return false;
      }
    });
    const icicleBuff = this.selectedCombatant.getBuff(SPELLS.ICICLES_BUFF.id, event.timestamp - 10);

    this.chillDebuffs.push({
      apply: event,
      refreshes,
      remove,
      flurryCast,
      damage,
      spentStacks: this.checkSpentStacks(spenders),
      precast,
      icicles: icicleBuff?.stacks || 0,
    });
  }

  checkSpentStacks(spenders: DamageEvent[]) {
    const spentStacks: WintersChillStacks[] = [];
    spenders.forEach((s) => {
      const debuff = this.enemies.getEntity(s)?.getBuff(SPELLS.WINTERS_CHILL.id, s.timestamp);
      if (FREE_SPENDERS.includes(s.ability.guid)) {
        const hits = spenders.filter((h) => h.ability.guid === s.ability.guid);
        spentStacks.push({
          spellId: s.ability.guid,
          stacks: debuff?.stacks || 0,
          hits: hits.length,
        });
      } else {
        spentStacks.push({
          spellId: s.ability.guid,
          stacks: debuff?.stacks || 0,
          hits: 1,
        });
      }
    });
    return spentStacks;
  }

  get preCastPercent() {
    const chillsWithPrecast = this.chillDebuffs.filter((c) => c.precast).length;
    return chillsWithPrecast / this.chillDebuffs.length;
  }

  get shatterPercent() {
    const shatters = [];
    this.chillDebuffs.forEach((s) =>
      shatters.push(s.damage.filter((d) => !FREE_SPENDERS.includes(d.ability.guid))),
    );
    return shatters.length / (this.chillDebuffs.length * 2);
  }

  // less strict than the ice lance suggestion both because it's less important,
  // and also because using a Brain Freeze after being forced to move is a good excuse for missing the hardcast.
  get wintersChillPreCastThresholds() {
    return {
      actual: this.preCastPercent,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.6,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get wintersChillShatterThresholds() {
    return {
      actual: this.shatterPercent,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.75,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(30)}
        size="flexible"
        tooltip={
          <>
            When casting Flurry, you should always ensure that you have something immediately before
            it (Like Frostbolt or Ebonbolt) as well as 2 Ice Lance Casts (Or Glacial Spike + Ice
            Lance) immediately after to get the most out of the Winter's Chill debuff that is
            applied to the target. Doing so will allow the cast before and the 2 casts after to all
            benefit from Shatter. Note that if you are very close to your target, then the ability
            you used immediately before Flurry might hit the target too quickly and not get
            shattered.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.WINTERS_CHILL}>
          <SpellIcon spell={SPELLS.WINTERS_CHILL} /> {formatPercentage(this.shatterPercent, 0)}%{' '}
          <small>Spells shattered</small>
          <br />
          <SpellIcon spell={SPELLS.FROSTBOLT} /> {formatPercentage(this.preCastPercent, 0)}%{' '}
          <small>Pre-casts shattered</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get wintersChillPrecastPerformance(): QualitativePerformance {
    let performance = QualitativePerformance.Good;
    if (this.preCastPercent < this.wintersChillPreCastThresholds.isLessThan.major) {
      performance = QualitativePerformance.Fail;
    } else if (this.preCastPercent < this.wintersChillPreCastThresholds.isLessThan.minor) {
      performance = QualitativePerformance.Ok;
    }

    return performance;
  }

  get wintersChillShatterPerformance(): QualitativePerformance {
    let performance = QualitativePerformance.Good;
    if (this.shatterPercent < this.wintersChillShatterThresholds.isLessThan.major) {
      performance = QualitativePerformance.Fail;
    } else if (this.shatterPercent < this.wintersChillShatterThresholds.isLessThan.minor) {
      performance = QualitativePerformance.Ok;
    }

    return performance;
  }
}

export interface WintersChillDebuff {
  apply: ApplyDebuffEvent;
  refreshes: RefreshDebuffEvent[];
  remove?: RemoveDebuffEvent;
  flurryCast?: CastEvent;
  damage: DamageEvent[];
  spentStacks: WintersChillStacks[];
  precast?: CastEvent;
  icicles: number;
}
