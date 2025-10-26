import type { JSX } from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Enemies from 'parser/shared/modules/Enemies';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { formatNumber } from 'common/format';
import UptimeIcon from 'interface/icons/Uptime';

import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';

import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';

import { COLLAPSING_VOID_DEVOURING_PLAGUE_MULTIPLIER } from '../../../constants';

//This is for Entropic Rift and Collapsing Void, and Darkening Horizon

class EntropicRift extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  //Collapsing Rift
  RiftDamageIncrease: BoxRowEntry[] = [];
  currentDP = 0;
  totalDP = 0;
  damageAmp = 0;
  damageAmpTotal = 0;

  castTime = 0;

  //darking Horizon
  RiftDurationIncrease: BoxRowEntry[] = [];
  currentVB = 0;
  totalVB = 0;

  damageRift = 0;
  damageCollapse = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.ENTROPIC_RIFT_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ENTROPIC_RIFT_DAMAGE),
      this.onRift,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.DEVOURING_PLAGUE_TALENT),
      this.onDP,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_PRIEST_VOIDWEAVER_VOID_BLAST),
      this.onVB,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.COLLAPSING_VOID_DAMAGE),
      this.onCollapse,
    );
  }

  onRift(event: DamageEvent) {
    this.damageRift += event.amount + (event.absorbed || 0);
  }

  onDP() {
    if (this.selectedCombatant.hasBuff(SPELLS.SHADOW_PRIEST_VOIDWEAVER_ENTROPIC_RIFT_BUFF)) {
      this.currentDP += 1;
    }
  }

  onVB() {
    if (this.selectedCombatant.hasBuff(SPELLS.SHADOW_PRIEST_VOIDWEAVER_ENTROPIC_RIFT_BUFF)) {
      this.currentVB += 1;
    }
  }

  onCollapse(event: DamageEvent) {
    this.damageCollapse += event.amount + (event.absorbed || 0);

    this.damageAmp = calculateEffectiveDamage(
      event,
      this.currentDP * COLLAPSING_VOID_DEVOURING_PLAGUE_MULTIPLIER,
    );
    this.damageAmpTotal += this.damageAmp;

    //Since the collapse hits multiple targets, each collapse has multiple damage events but we only want one per cast.
    //TODO: Use eventlink instead of checking timestamps.
    if (event.timestamp - this.castTime >= 100) {
      this.castTime = event.timestamp;

      //Collapsing void
      this.totalDP += this.currentDP;
      this.finalizeRiftDamage();
      this.currentDP = 0;

      //Darkening Horizon
      if (this.currentVB > 3) {
        this.currentVB = 3;
      } //VB can only give 3 seconds of extension
      this.totalVB += this.currentVB;
      this.finalizeRiftTime();
      this.currentVB = 0;
    }
  }

  private finalizeRiftDamage() {
    if (this.castTime !== 0) {
      const tooltip = (
        <>
          @<strong>{this.owner.formatTimestamp(this.castTime)}</strong>,{' '}
          <strong>{this.currentDP}</strong> Devouring Plagues
        </>
      );

      let value = QualitativePerformance.Good;
      if (this.currentDP <= 1) {
        value = QualitativePerformance.Ok;
      }
      if (this.currentDP <= 0) {
        value = QualitativePerformance.Fail;
      }

      this.RiftDamageIncrease.push({ value, tooltip });
    }
  }

  private finalizeRiftTime() {
    if (this.castTime !== 0) {
      const tooltip = (
        <>
          @<strong>{this.owner.formatTimestamp(this.castTime)}</strong>,{' '}
          <strong>{this.currentVB}</strong> sec of increased duration
        </>
      );

      let value = QualitativePerformance.Good;
      if (this.currentVB <= 2) {
        value = QualitativePerformance.Ok;
      }
      if (this.currentVB <= 1) {
        value = QualitativePerformance.Fail;
      }

      this.RiftDurationIncrease.push({ value, tooltip });
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            {formatNumber((this.damageAmpTotal / this.owner.fightDuration) * 1000)} DPS is from the
            increase due to {this.totalDP} casts of Devouring Plauge
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.ENTROPIC_RIFT_TALENT}>
          <ItemDamageDone amount={this.damageRift} />
        </BoringSpellValueText>
        <BoringSpellValueText spell={TALENTS.COLLAPSING_VOID_TALENT}>
          <ItemDamageDone amount={this.damageCollapse} />
        </BoringSpellValueText>
        {this.selectedCombatant.hasTalent(TALENTS.DARKENING_HORIZON_TALENT) && (
          <BoringSpellValueText spell={TALENTS.DARKENING_HORIZON_TALENT}>
            <UptimeIcon /> {this.totalVB.toFixed(1)}s <small>of rift extension</small>{' '}
          </BoringSpellValueText>
        )}
      </Statistic>
    );
  }

  get guideSubsectionCollapsingVoid(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.COLLAPSING_VOID_TALENT} />
        </b>{' '}
        deals damage to all targets in the area at the end of{' '}
        <SpellLink spell={TALENTS.ENTROPIC_RIFT_TALENT} />.
        <br />
        This damage is increased by 20% per cast of{' '}
        <SpellLink spell={TALENTS.DEVOURING_PLAGUE_TALENT} /> while the rift is active.
        <br />
      </p>
    );

    const data = (
      <div>
        <strong>Rift Damage Increase</strong>
        <br />
        <PerformanceBoxRow values={this.RiftDamageIncrease} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }

  get guideSubsectionDarkeningHorizon(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.DARKENING_HORIZON_TALENT} />
        </b>{' '}
        increases the duration of <SpellLink spell={TALENTS.ENTROPIC_RIFT_TALENT} />.
        <br />
        The duration is increased by 1 second per cast of{' '}
        <SpellLink spell={TALENTS.VOID_BLAST_TALENT} />, up to 3 seconds.
        <br />
      </p>
    );

    const data = (
      <div>
        <strong>Rift Duration Increase</strong>
        <br />
        <PerformanceBoxRow values={this.RiftDurationIncrease} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default EntropicRift;
