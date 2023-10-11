import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbilityEvent,
  ApplyBuffEvent,
  ApplyDebuffEvent,
  BeaconHealEvent,
  DamageEvent,
  GetRelatedEvent,
  HasRelatedEvent,
  HealEvent,
  RemoveBuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import BeaconHealSource from '../../beacons/BeaconHealSource';
import { ALL_HOLY_POWER_SPENDERS } from 'analysis/retail/paladin/shared/constants';
import Spell from 'common/SPELLS/Spell';
import TalentAggregateBars from 'parser/ui/TalentAggregateStatistic';
import TalentAggregateStatisticContainer from 'parser/ui/TalentAggregateStatisticContainer';
import { formatNumber } from 'common/format';
import { GLIMMER_PROC } from '../../../normalizers/CastLinkNormalizer';

const GLISTENING_RADIANCE_IDS = Object.fromEntries(
  ALL_HOLY_POWER_SPENDERS.map((spender) => {
    return [spender.id, TALENTS.GLISTENING_RADIANCE_TALENT.id];
  }),
);

/**
 * Glimmer of Light
 * Requires Paladin (Holy, Holy)
 * Holy Shock leaves a Glimmer of Light on the target for 30 sec.
 * When you Holy Shock, all targets with Glimmer of Light are damaged for 1076 or healed for 1587. (at ilvl 400)
 * Example Log: https://www.warcraftlogs.com/reports/TX4nzPy8WwrfLv97#fight=19&type=auras&source=5&ability=287280
 */
class GlimmerOfLight extends Analyzer {
  static dependencies = {
    beaconHealSource: BeaconHealSource,
  };

  GLIMMER_CAP = 3;

  glimmerStatTracker: GlimmerMap = {};
  glimmerBuffTracker: { [key: number]: number } = {};

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.GLIMMER_OF_LIGHT_TALENT);
    if (!this.active) {
      return;
    }

    this.glimmerStatTracker[TALENTS.HOLY_SHOCK_TALENT.id] = emptyGlimmerSource(
      TALENTS.HOLY_SHOCK_TALENT,
    );

    this.GLIMMER_CAP = this.selectedCombatant.hasTalent(TALENTS.ILLUMINATION_TALENT)
      ? 8
      : this.GLIMMER_CAP;
    this.GLIMMER_CAP = this.selectedCombatant.hasTalent(TALENTS.BLESSED_FOCUS_TALENT)
      ? 1
      : this.GLIMMER_CAP;

    // Base Glimmer tracking Requirements
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.HOLY_SHOCK_TALENT),
      this.updateProcs,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GLIMMER_OF_LIGHT_HEAL_TALENT),
      this.onGlimmerHeal,
    );
    this.addEventListener(Events.beacontransfer.by(SELECTED_PLAYER), this.onBeaconTransfer);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.GLIMMER_OF_LIGHT_DAMAGE_TALENT),
      this.onGlimmerDamage,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.GLIMMER_OF_LIGHT_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.GLIMMER_OF_LIGHT_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.GLIMMER_OF_LIGHT_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.GLIMMER_OF_LIGHT_BUFF),
      this.onRemoveBuff,
    );

    // if we have Glistening Radiance do these things
    if (this.selectedCombatant.hasTalent(TALENTS.GLISTENING_RADIANCE_TALENT)) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(ALL_HOLY_POWER_SPENDERS),
        this.updateProcs,
      );
      this.glimmerStatTracker[TALENTS.GLISTENING_RADIANCE_TALENT.id] = emptyGlimmerSource(
        TALENTS.GLISTENING_RADIANCE_TALENT,
      );
    }

    // if we have DayBreak do these things
    if (this.selectedCombatant.hasTalent(TALENTS.DAYBREAK_TALENT)) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS.DAYBREAK_TALENT),
        this.updateProcs,
      );
      this.glimmerStatTracker[TALENTS.DAYBREAK_TALENT.id] = emptyGlimmerSource(
        TALENTS.DAYBREAK_TALENT,
      );
    }
    // if we have divine toll
    if (this.selectedCombatant.hasTalent(TALENTS.DIVINE_TOLL_TALENT)) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS.DIVINE_TOLL_TALENT),
        this.updateProcs,
      );
      this.glimmerStatTracker[TALENTS.DIVINE_TOLL_TALENT.id] = emptyGlimmerSource(
        TALENTS.DIVINE_TOLL_TALENT,
      );
    }

    if (this.selectedCombatant.hasTalent(TALENTS.RISING_SUNLIGHT_TALENT)) {
      this.addEventListener(
        Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.RISING_SUNLIGHT_BUFF),
        this.updateProcs,
      );
      this.addEventListener(
        Events.removebuffstack.to(SELECTED_PLAYER).spell(SPELLS.RISING_SUNLIGHT_BUFF),
        this.updateProcs,
      );
      this.glimmerStatTracker[SPELLS.RISING_SUNLIGHT_BUFF.id] = emptyGlimmerSource(
        TALENTS.RISING_SUNLIGHT_TALENT,
      );
    }
  }

  updateProcs(event: AbilityEvent<any>) {
    if (!HasRelatedEvent(event, GLIMMER_PROC)) {
      return;
    }
    const sourceID = event.ability.guid;
    const fixedID = GLISTENING_RADIANCE_IDS[sourceID] ?? sourceID;
    this.glimmerStatTracker[fixedID].procs += 1;
  }

  getGlimmerSource(event: HealEvent | DamageEvent) {
    if (HasRelatedEvent(event, GLIMMER_PROC)) {
      const sourceEvent = GetRelatedEvent<AbilityEvent<any>>(event, GLIMMER_PROC)!;
      const sourceID = sourceEvent.ability.guid;
      const fixedID = GLISTENING_RADIANCE_IDS[sourceID] ?? sourceID;

      return fixedID;
    }
  }

  onBeaconTransfer(event: BeaconHealEvent) {
    const spellId = event.originalHeal.ability.guid;
    if (spellId !== SPELLS.GLIMMER_OF_LIGHT_HEAL_TALENT.id) {
      return;
    }
    const source = this.getGlimmerSource(event.originalHeal);
    if (!source) {
      this.error('no source found for glimmer', event.originalHeal);
      return;
    }
    const amount = event.amount + (event.absorbed || 0);

    const toUpdate = this.glimmerStatTracker[source];
    if (!toUpdate) {
      this.warn('untracked glimmer source', source);
      return;
    }

    toUpdate.beacon += amount;
  }

  onApplyBuff(event: ApplyBuffEvent | ApplyDebuffEvent) {
    this.glimmerBuffTracker[event.targetID] = event.timestamp;
  }

  onRemoveBuff(event: RemoveBuffEvent | RemoveDebuffEvent) {
    delete this.glimmerBuffTracker[event.targetID];
  }

  onGlimmerDamage(event: DamageEvent) {
    const amount = event.amount + (event.absorbed || 0);
    const source = this.getGlimmerSource(event);
    if (!source) {
      this.error('no source found for glimmer', event);
      return;
    }

    const toUpdate = this.glimmerStatTracker[source];
    if (!toUpdate) {
      this.warn('untracked glimmer source', source);
      return;
    }

    toUpdate.damage += amount;
    toUpdate.hits += 1;
  }

  onGlimmerHeal(event: HealEvent) {
    const amount = event.amount + (event.absorbed || 0);
    const source = this.getGlimmerSource(event);
    if (!source) {
      this.error('no source found for glimmer', event);
      return;
    }

    const toUpdate = this.glimmerStatTracker[source];
    if (!toUpdate) {
      this.warn('untracked glimmer source', source);
      return;
    }

    toUpdate.healing += amount;
    toUpdate.hits += 1;
  }

  procsPerTrigger(source: GlimmerSource) {
    let rv = source.hits / source.procs;
    // Rising Sunlight procs 2 extra holy shocks, each one triggers your glimmers.
    // Divide by 2 here for clarity to show how many glimmers you had out rather than
    // how many damage/heal events were triggered.
    if (source.spell.id === TALENTS.RISING_SUNLIGHT_TALENT.id) {
      rv = rv / 2;
    }
    return rv.toFixed(1);
  }

  makeBars() {
    return Object.keys(this.glimmerStatTracker).map((key) => {
      const source = this.glimmerStatTracker[Number(key)];

      return {
        spell: source.spell,
        amount: source.healing + source.beacon,
        color: '#ff6200',
        tooltip: (
          <>
            Healing: {formatNumber(source.healing)} <br />
            Beacon: {formatNumber(source.beacon)} <br />
            Damage: {formatNumber(source.damage)} <br />
            Procs/Trigger: {this.procsPerTrigger(source)}
          </>
        ),
        subSpecs: [
          {
            spell: SPELLS.BEACON_OF_LIGHT_HEAL,
            amount: source.beacon,
            color: '#ffac1c',
          },
        ],
      };
    });
  }

  statistic() {
    const totalHealing = Object.keys(this.glimmerStatTracker)
      .map(
        (key) =>
          this.glimmerStatTracker[Number(key)].healing +
          this.glimmerStatTracker[Number(key)].beacon,
      )
      .reduce((previous, current) => previous + current);

    return (
      <TalentAggregateStatisticContainer
        title={
          <>
            <SpellLink spell={TALENTS.GLIMMER_OF_LIGHT_TALENT} /> -{' '}
            <ItemHealingDone amount={totalHealing} />
          </>
        }
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(1)}
        wide
      >
        <TalentAggregateBars bars={this.makeBars()} wide></TalentAggregateBars>
      </TalentAggregateStatisticContainer>
    );
  }
}

export default GlimmerOfLight;

type GlimmerMap = {
  [key: number]: GlimmerSource;
};

type GlimmerSource = {
  procs: number;
  damage: number;
  healing: number;
  hits: number;
  beacon: number;
  spell: Spell;
};

const emptyGlimmerSource = (spell: Spell): GlimmerSource => ({
  beacon: 0,
  damage: 0,
  healing: 0,
  hits: 0,
  procs: 0,
  spell,
});
