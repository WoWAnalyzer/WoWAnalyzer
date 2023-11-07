import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import SpellUsable from 'analysis/retail/monk/windwalker/modules/core/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import { ABILITIES_AFFECTED_BY_DAMAGE_INCREASES } from '../../constants';
import { TALENTS_MONK } from 'common/TALENTS';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';

const DAMAGE_MULTIPLIER = 0.15;

const MOD_RATE = 2;
const MOD_RATE_ABILITIES = [
  SPELLS.FISTS_OF_FURY_CAST.id,
  TALENTS_MONK.RISING_SUN_KICK_TALENT.id,
  TALENTS_MONK.STRIKE_OF_THE_WINDLORD_TALENT.id,
  TALENTS_MONK.RUSHING_JADE_WIND_TALENT.id,
];

/**
 * Tracks damage increase and cooldown reduction from
 * [Serenity](https://www.wowhead.com/spell=152173/serenity).
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/HYTBGcXtV4AN27QW#fight=last&type=damage-done&source=27
 */
class Serenity extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  damageGain = 0;
  effectiveRisingSunKickReductionMs = 0;
  effectiveFistsOfFuryReductionMs = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.SERENITY_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.SERENITY_TALENT),
      this.onSerenityStart,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.SERENITY_TALENT),
      this.onSerenityEnd,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(ABILITIES_AFFECTED_BY_DAMAGE_INCREASES),
      this.onAffectedDamage,
    );
  }

  _reduceRSK() {
    if (this.spellUsable.isOnCooldown(TALENTS_MONK.RISING_SUN_KICK_TALENT.id)) {
      const cooldownReduction =
        this.spellUsable.cooldownRemaining(TALENTS_MONK.RISING_SUN_KICK_TALENT.id) * 0.5;
      this.spellUsable.reduceCooldown(TALENTS_MONK.RISING_SUN_KICK_TALENT.id, cooldownReduction);
      this.effectiveRisingSunKickReductionMs += cooldownReduction;
    }
  }

  _reduceFoF() {
    if (this.spellUsable.isOnCooldown(SPELLS.FISTS_OF_FURY_CAST.id)) {
      const cooldownReduction =
        this.spellUsable.cooldownRemaining(SPELLS.FISTS_OF_FURY_CAST.id) * 0.5;
      this.spellUsable.reduceCooldown(SPELLS.FISTS_OF_FURY_CAST.id, cooldownReduction);
      this.effectiveFistsOfFuryReductionMs += cooldownReduction;
    }
  }

  onSerenityStart() {
    this.spellUsable.applyCooldownRateChange(MOD_RATE_ABILITIES, MOD_RATE);
  }

  onSerenityEnd() {
    this.spellUsable.removeCooldownRateChange(MOD_RATE_ABILITIES, MOD_RATE);
  }

  onAffectedDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(TALENTS_MONK.SERENITY_TALENT.id)) {
      return;
    }
    this.damageGain += calculateEffectiveDamage(event, DAMAGE_MULTIPLIER);
  }

  get dps() {
    return (this.damageGain / this.owner.fightDuration) * 1000;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
        tooltip={
          <>
            Total damage increase: {formatNumber(this.damageGain)}.
            <br />
            The damage increase is calculated from the {formatPercentage(DAMAGE_MULTIPLIER)}% damage
            bonus and doesn't count raw damage from extra casts gained from cooldown reduction.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_MONK.SERENITY_TALENT}>
          <img src="/img/sword.png" alt="Damage" className="icon" /> {formatNumber(this.dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damageGain))} % of
            total
          </small>
          <br />
          <span style={{ fontSize: '75%' }}>
            <SpellIcon
              spell={TALENTS_MONK.RISING_SUN_KICK_TALENT}
              style={{
                height: '1.3em',
                marginTop: '-1.em',
              }}
            />{' '}
            {(this.effectiveRisingSunKickReductionMs / 1000).toFixed(1)}{' '}
            <small>Seconds reduced</small>
            <br />
            <SpellIcon
              spell={SPELLS.FISTS_OF_FURY_CAST}
              style={{
                height: '1.3em',
                marginTop: '-1.em',
              }}
            />{' '}
            {(this.effectiveFistsOfFuryReductionMs / 1000).toFixed(1)}{' '}
            <small>Seconds reduced</small>
          </span>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_MONK.SERENITY_TALENT} />
        </b>{' '}
        makes all of your abilities do amplified damage and all spenders are free for the duration.
        This should be synced with{' '}
        <SpellLink spell={TALENTS_MONK.INVOKE_XUEN_THE_WHITE_TIGER_TALENT} /> unless an entire cast
        would be missed for doing so.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_MONK.SERENITY_TALENT} /> cast efficiency
          </strong>
          {this.guideSubStatistic()}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  guideSubStatistic() {
    return (
      <CastEfficiencyBar
        spellId={TALENTS_MONK.SERENITY_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}

export default Serenity;
