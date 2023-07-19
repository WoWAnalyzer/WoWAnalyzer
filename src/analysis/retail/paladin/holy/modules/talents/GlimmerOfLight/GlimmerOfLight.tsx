import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyDebuffEvent,
  BeaconHealEvent,
  CastEvent,
  DamageEvent,
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

const DEBUG = false;

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
  lastCast = -1;
  lastCastTime = -1;
  lastGlisteningRadianceProc = -1;

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
      this.updateLastCast,
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
        this.updateLastCast,
      );
      this.glimmerStatTracker[TALENTS.GLISTENING_RADIANCE_TALENT.id] = emptyGlimmerSource(
        TALENTS.GLISTENING_RADIANCE_TALENT,
      );
    }

    // if we have DayBreak do these things
    if (this.selectedCombatant.hasTalent(TALENTS.DAYBREAK_TALENT)) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS.DAYBREAK_TALENT),
        this.updateLastCast,
      );
      this.glimmerStatTracker[TALENTS.DAYBREAK_TALENT.id] = emptyGlimmerSource(
        TALENTS.DAYBREAK_TALENT,
      );
    }
    // if we have divine toll
    if (this.selectedCombatant.hasTalent(TALENTS.DIVINE_TOLL_TALENT)) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS.DIVINE_TOLL_TALENT),
        this.updateLastCast,
      );
      this.glimmerStatTracker[TALENTS.DIVINE_TOLL_TALENT.id] = emptyGlimmerSource(
        TALENTS.DIVINE_TOLL_TALENT,
      );
    }
  }

  onBeaconTransfer(event: BeaconHealEvent) {
    const spellId = event.originalHeal.ability.guid;
    if (spellId !== SPELLS.GLIMMER_OF_LIGHT_HEAL_TALENT.id) {
      return;
    }
    const amount = event.amount + (event.absorbed || 0);

    const toUpdate = this.glimmerStatTracker[this.lastCast];
    if (!toUpdate) {
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
    this.updateGR(event);
    const amount = event.amount + (event.absorbed || 0);

    const toUpdate = this.glimmerStatTracker[this.lastCast];
    if (!toUpdate) {
      return;
    }

    toUpdate.damage += amount;
    toUpdate.hits += 1;
  }

  onGlimmerHeal(event: HealEvent) {
    this.updateGR(event);
    const amount = event.amount + (event.absorbed || 0);
    if (DEBUG && this.lastCast === TALENTS.GLISTENING_RADIANCE_TALENT.id) {
      console.log(
        `amount: ${event.amount} absorbed: ${event.absorbed || 0} overheal: ${event.overheal || 0}`,
      );
    }

    const toUpdate = this.glimmerStatTracker[this.lastCast];
    if (!toUpdate) {
      return;
    }

    toUpdate.healing += amount;
    toUpdate.hits += 1;
    if (DEBUG && this.lastCast === TALENTS.GLISTENING_RADIANCE_TALENT.id) {
      console.log(toUpdate);
    }
  }

  updateGR(event: DamageEvent | HealEvent) {
    if (
      this.lastCast === TALENTS.GLISTENING_RADIANCE_TALENT.id &&
      this.lastCastTime > this.lastGlisteningRadianceProc + 250
    ) {
      this.glimmerStatTracker[this.lastCast].procs += 1;
      this.lastGlisteningRadianceProc = event.timestamp;
    }
  }

  updateLastCast(event: CastEvent) {
    this.lastCastTime = event.timestamp;
    const holyPowerBased = ALL_HOLY_POWER_SPENDERS.find((spell) => spell.id === event.ability.guid);
    if (holyPowerBased) {
      this.lastCast = TALENTS.GLISTENING_RADIANCE_TALENT.id;
    } else {
      this.lastCast = event.ability.guid;
      this.glimmerStatTracker[this.lastCast].procs += 1;
    }
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
            Procs/Trigger: {(source.hits / source.procs).toFixed(1)}
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
