import { Trans } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
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
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import BeaconHealSource from '../beacons/BeaconHealSource';

/**
 * Glimmer of Light
 * Requires Paladin (Holy, Holy)
 * Holy Shock leaves a Glimmer of Light on the target for 30 sec.
 * When you Holy Shock, all targets with Glimmer of Light are damaged for 1076 or healed for 1587. (at ilvl 400)
 * Example Log: https://www.warcraftlogs.com/reports/TX4nzPy8WwrfLv97#fight=19&type=auras&source=5&ability=287280
 */

const BUFF_DURATION = 30;
const GLIMMER_CAP = 8;

class GlimmerOfLight extends Analyzer {
  static dependencies = {
    beaconHealSource: BeaconHealSource,
  };

  casts = 0;
  damage = 0;
  earlyRefresh = 0;
  glimmerBuffs: Array<ApplyBuffEvent | ApplyDebuffEvent> = [];
  glimmerHits = 0;
  healing = 0;
  overCapHealing = 0;
  healingTransfered = 0;
  overCap = 0;
  wastedEarlyRefresh = 0;
  wastedOverCap = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.GLIMMER_OF_LIGHT_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_SHOCK_CAST),
      this.onCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GLIMMER_OF_LIGHT_HEAL_TALENT),
      this.onHeal,
    );
    this.addEventListener(Events.beacontransfer.by(SELECTED_PLAYER), this.onBeaconTransfer);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.GLIMMER_OF_LIGHT_DAMAGE_TALENT),
      this.onDamage,
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
  }

  onBeaconTransfer(event: BeaconHealEvent) {
    const spellId = event.originalHeal.ability.guid;
    if (spellId !== TALENTS.GLIMMER_OF_LIGHT_TALENT.id) {
      return;
    }
    this.healingTransfered += event.amount + (event.absorbed || 0);
  }

  onApplyBuff(event: ApplyBuffEvent | ApplyDebuffEvent) {
    this.glimmerBuffs.unshift(event);
  }

  onRemoveBuff(event: RemoveBuffEvent | RemoveDebuffEvent) {
    this.glimmerBuffs = this.glimmerBuffs.filter((buff) => buff.targetID !== event.targetID);
  }

  onCast(event: CastEvent) {
    this.casts += 1;

    const index = this.glimmerBuffs.findIndex((g) => g.targetID === event.targetID);

    if (this.glimmerBuffs.length >= GLIMMER_CAP) {
      // Cast a new one while at cap (applybuff will occur later, so this will be accurate)
      this.overCap += 1;
      if (index < 0) {
        this.wastedOverCap +=
          BUFF_DURATION * 1000 - (event.timestamp - this.glimmerBuffs[GLIMMER_CAP - 1].timestamp);
      } else {
        this.wastedOverCap +=
          BUFF_DURATION * 1000 - (event.timestamp - this.glimmerBuffs[index].timestamp);
      }
    } else if (index >= 0) {
      // if an active glimmer was overwritten //
      this.wastedEarlyRefresh +=
        BUFF_DURATION * 1000 - (event.timestamp - this.glimmerBuffs[index].timestamp);
      this.earlyRefresh += 1;
    }
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
    this.glimmerHits += 1;
  }

  onHeal(event: HealEvent) {
    this.healing += event.amount + (event.absorbed || 0);
    this.glimmerHits += 1;
  }

  get hitsPerCast() {
    return this.glimmerHits / this.casts;
  }

  get holyShocksPerMinute() {
    return this.casts / (this.owner.fightDuration / 60000);
  }

  get totalHealing() {
    return this.healing + this.healingTransfered;
  }

  get earlyGlimmerRefreshLoss() {
    return this.wastedEarlyRefresh / (this.casts * BUFF_DURATION * 1000);
  }

  get overCapGlimmerLoss() {
    return this.wastedOverCap / (this.casts * BUFF_DURATION * 1000);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Total healing done: <b>{formatNumber(this.totalHealing)}</b>
            <br />
            Beacon healing transfered: <b>{formatNumber(this.healingTransfered)}</b>
            <br />
            Glimmer damage: <b>{formatNumber(this.damage)}</b>
            <br />
            Holy Shocks/minute: <b>{this.holyShocksPerMinute.toFixed(1)}</b>
            <br />
            Early refresh(s): <b>{this.earlyRefresh}</b>
            <br />
            Lost to early refresh:{' '}
            <b>
              {(this.wastedEarlyRefresh / 1000).toFixed(1)}(sec){' '}
              {(this.earlyGlimmerRefreshLoss * 100).toFixed(1)}%
            </b>
            <br />
            Glimmer of Lights over {GLIMMER_CAP} buff cap: <b>{this.overCap}</b>
            <br />
            Lost to over capping:{' '}
            <b>
              {(this.wastedOverCap / 1000).toFixed(1)}(sec){' '}
              {(this.overCapGlimmerLoss * 100).toFixed(1)}%
            </b>
            <br />
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.GLIMMER_OF_LIGHT_TALENT.id}>
          <ItemHealingDone amount={this.totalHealing} /> <br />
          <ItemDamageDone amount={this.damage} /> <br />
          {this.hitsPerCast.toFixed(1)} Triggers/Cast
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get suggestEarlyRefresh() {
    return {
      actual: this.earlyGlimmerRefreshLoss,
      isGreaterThan: {
        minor: 0.15,
        average: 0.25,
        major: 0.35,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestGlimmerCap() {
    return {
      actual: this.overCapGlimmerLoss,
      isGreaterThan: {
        minor: 0.15,
        average: 0.25,
        major: 0.35,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestEarlyRefresh).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <Trans id="paladin.holy.modules.talents.glimmerOfLight">
          Your usage of <SpellLink id={TALENTS.GLIMMER_OF_LIGHT_TALENT.id} /> can be improved. To
          maximize the healing/damage done by <SpellLink id={TALENTS.GLIMMER_OF_LIGHT_TALENT.id} />,
          try to keep as many buffs up as possible. Avoid overwritting buffs early, this suggestion
          does not take priority over healing targets with low health. If two targets have similar
          health pools priorize the target without a glimmer as your{' '}
          <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} /> will heal all players with active buffs.
        </Trans>,
      )
        .icon(TALENTS.GLIMMER_OF_LIGHT_TALENT.icon)
        .actual(
          `Uptime lost to early Glimmer refresh was ${formatPercentage(
            this.earlyGlimmerRefreshLoss,
          )}%`,
        )
        .recommended(`< ${this.suggestEarlyRefresh.isGreaterThan.minor * 100}% is recommended`),
    );
  }
}

export default GlimmerOfLight;
