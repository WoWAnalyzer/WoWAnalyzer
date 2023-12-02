import { Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { TIERS } from 'game/TIERS';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { SpellLink } from 'interface';
import Events, {
  DamageEvent,
  CastEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  ApplyBuffEvent,
  GetRelatedEvent,
} from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Enemies, { encodeTargetString } from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import CooldownHistory from 'parser/shared/modules/CooldownHistory';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const CAST_BUFFER_MS = 65;

class CharringEmbers extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    cooldownHistory: CooldownHistory,
    spellUsable: SpellUsable,
  };
  protected enemies!: Enemies;
  protected cooldownHistory!: CooldownHistory;
  protected spellUsable!: SpellUsable;

  flamesFuryRefreshes: RefreshBuffEvent[] = [];
  flamesFury: {
    buffApply: ApplyBuffEvent | undefined;
    buffRemove: RemoveBuffEvent;
    spender: CastEvent | undefined;
    expired: boolean;
  }[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.T30);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PHOENIX_FLAMES_DAMAGE),
      this.onPhoenixDamage,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.FLAMES_FURY),
      this.onFlamesFuryEnd,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.FLAMES_FURY),
      this.onFlamesFuryRefresh,
    );
  }

  onFlamesFuryEnd(event: RemoveBuffEvent) {
    const buffApply: ApplyBuffEvent | undefined = GetRelatedEvent(event, 'BuffApply');
    const spender: CastEvent | undefined = GetRelatedEvent(event, 'SpellCast');
    const spenderDamage: DamageEvent | undefined =
      spender && GetRelatedEvent(spender, 'SpellDamage');
    this.flamesFury.push({
      buffApply: buffApply,
      buffRemove: event,
      spender: spender,
      expired: !spenderDamage || event.timestamp - spenderDamage.timestamp > CAST_BUFFER_MS,
    });
  }

  onFlamesFuryRefresh(event: RefreshBuffEvent) {
    this.flamesFuryRefreshes.push(event);
  }

  onPhoenixDamage(event: DamageEvent) {
    const cast: CastEvent | undefined = GetRelatedEvent(event, 'SpellCast');
    if (!cast || !this.selectedCombatant.hasBuff(SPELLS.FLAMES_FURY.id, event.timestamp - 10)) {
      return;
    }

    const castTarget = encodeTargetString(cast.targetID || 0, cast.targetInstance);
    const damageTarget = encodeTargetString(event.targetID, event.targetInstance);
    if (castTarget === damageTarget) {
      this.spellUsable.reduceCooldown(TALENTS.PHOENIX_FLAMES_TALENT.id, 25000);
    }
  }

  charringEmbersUptime = () => {
    const history = this.enemies.getDebuffHistory(SPELLS.CHARRING_EMBERS_DEBUFF.id);
    let uptime = 0;
    history.forEach((d) => (uptime += d.end - d.start));
    return uptime;
  };

  overwrittenProcs = () => {
    if (this.flamesFuryRefreshes) {
      let overwritten = 0;
      this.flamesFuryRefreshes.forEach((r) => {
        const prevProcs = this.selectedCombatant.getBuff(SPELLS.FLAMES_FURY.id, r.timestamp - 10);
        overwritten += prevProcs && prevProcs.stacks ? prevProcs.stacks : 0;
      });
      return overwritten;
    } else {
      return 0;
    }
  };

  expiredProcs = () => {
    const expires = this.flamesFury.filter((e) => e.expired === true);

    let expiredProcs = 0;
    expires.forEach((e) => {
      const prevProcs = this.selectedCombatant.getBuff(
        SPELLS.FLAMES_FURY.id,
        e.buffRemove.timestamp - 10,
      );
      expiredProcs += prevProcs && prevProcs.stacks ? prevProcs.stacks : 0;
    });
    return expiredProcs;
  };

  noPhoenixFlames = () => {
    let noPhoenixFlames = 0;
    this.flamesFury.forEach((buff) => {
      if (
        buff.buffApply &&
        !this.cooldownHistory.wasAvailable(
          TALENTS.PHOENIX_FLAMES_TALENT.id,
          buff.buffApply.timestamp,
        )
      ) {
        noPhoenixFlames += 1;
      }
    });
    return noPhoenixFlames;
  };

  get uptimePercent() {
    return this.charringEmbersUptime() / this.owner.fightDuration;
  }

  get wastedProcs() {
    return this.overwrittenProcs() + this.expiredProcs();
  }

  get noPhoenixFlamesThresholds() {
    return {
      actual: this.noPhoenixFlames(),
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get wastedProcsThresholds() {
    return {
      actual: this.wastedProcs,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get charringEmbersUptimeThresholds() {
    return {
      actual: this.uptimePercent,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.noPhoenixFlamesThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink spell={SPELLS.FLAMES_FURY} /> proc'd {this.noPhoenixFlames()} times while
          you had no charges of <SpellLink spell={TALENTS.PHOENIX_FLAMES_TALENT} /> available.
          Because of this, you were forced to wait for{' '}
          <SpellLink spell={TALENTS.PHOENIX_FLAMES_TALENT} /> to come off cooldown before you could
          use these charges. To prevent this, you should avoid using all of your{' '}
          <SpellLink spell={TALENTS.PHOENIX_FLAMES_TALENT} /> charges to ensure you always have one
          charge available, or will gain a charge within a few seconds, when{' '}
          <SpellLink spell={SPELLS.FLAMES_FURY} /> triggers.
        </>,
      )
        .icon(SPELLS.CHARRING_EMBERS_DEBUFF.icon)
        .actual(
          <Trans id="mage.fire.suggestions.charringEmbers.noPhoenixFlames">
            {actual} procs without Phoenix Flames
          </Trans>,
        )
        .recommended(`>${recommended} is recommended`),
    );
    when(this.wastedProcsThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You had {this.overwrittenProcs()} procs of <SpellLink spell={SPELLS.FLAMES_FURY} /> that
          were overwritten and {this.expiredProcs()} procs which expired. Make sure you use your
          procs before they expire or before <SpellLink spell={SPELLS.FLAMES_FURY} /> procs again.
        </>,
      )
        .icon(SPELLS.CHARRING_EMBERS_DEBUFF.icon)
        .actual(
          <Trans id="mage.fire.suggestions.charringEmbers.wastedProcs">
            {actual} procs wasted
          </Trans>,
        )
        .recommended(`>${recommended} is recommended`),
    );
    when(this.charringEmbersUptimeThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You had {formatPercentage(actual)}% uptime on{' '}
          <SpellLink spell={SPELLS.CHARRING_EMBERS_DEBUFF} />. In order to maximize your damage, you
          should keep this debuff up for as much of the fight as possible. To do this, you can use{' '}
          <SpellLink spell={TALENTS.PHOENIX_FLAMES_TALENT} /> outside of{' '}
          <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> when the debuff is about to fall off.
          Though you should also ensure that you do not use all of your{' '}
          <SpellLink spell={TALENTS.PHOENIX_FLAMES_TALENT} /> charges to avoid a situation where{' '}
          <SpellLink spell={SPELLS.FLAMES_FURY} /> procs and you cannot use it.
        </>,
      )
        .icon(SPELLS.CHARRING_EMBERS_DEBUFF.icon)
        .actual(
          <Trans id="mage.fire.suggestions.charringEmbers.uptimePercent">
            {formatPercentage(actual)}% utilization
          </Trans>,
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
        <BoringSpellValueText spell={SPELLS.CHARRING_EMBERS_DEBUFF}>
          <>
            {formatPercentage(this.uptimePercent, 2)}% <small>Debuff Uptime</small>
            <br />
            {this.wastedProcs} <small>Wasted Procs</small>
            <br />
            {this.noPhoenixFlames()} <small>Procs w/o Phoenix Flames avail.</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CharringEmbers;
