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

import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';

import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';

import { COLLAPSING_VOID_DEVOURING_PLAGUE_MULTIPLIER } from '../../../constants';

//This is for Entropic Rift and Collapsing Void

class EntropicRift extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  RiftDamageIncrease: BoxRowEntry[] = [];
  currentDP = 0;
  totalDP = 0;
  damageAmp = 0;
  damageAmpTotal = 0;
  castTime = 0;

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
      this.totalDP += 1;
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
    if (event.timestamp - this.castTime >= 100) {
      this.castTime = event.timestamp;
      this.finalizeRift();
      this.currentDP = 0;
    }
  }

  private finalizeRift() {
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
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
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
        <strong>Rift Damage Amp</strong>
        <br />
        <PerformanceBoxRow values={this.RiftDamageIncrease} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default EntropicRift;
