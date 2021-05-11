import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import COVENANTS from 'game/shadowlands/COVENANTS';
import Events, { AbsorbedEvent, CastEvent, DamageEvent, HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { formatNumber } from 'common/format';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import React from 'react';

const KINDRED_SPIRITS_DURATION = 10_000;
const LONE_MEDITATION_BOOST = 0.15;

/**
 * **Kindred Spirits**
 * Covenant Ability - Kyrian
 *
 * Form a bond with an ally. Every 1 min, you may empower the bond for 10 sec, granting you an
 * effect based on your partner's role, and granting them an effect based on your role.
 *
 * Tank - Kindred Protection: Protect your bonded partner, redirecting 40% of damage
 * they take to you, unless you fall below 20% health.
 *
 * Healer - Kindred Focus: Focus on your bonded partner,
 * replicating 30% of all healing you deal onto them.
 *
 * Damage - Kindred Empowerment: Energize your bonded partner, granting them 20% of your damage
 * as additional Arcane damage, healing, or absorption.
 *
 * NONE - Lone Meditation: Connect with your inner spirit,
 * increasing healing done by 15% for 10 sec.
 *
 */
class KindredSpiritsResto extends Analyzer {

  _empowerCasts: number = 0;
  _meditateCasts: number = 0;

  /**
   * Timestamp of the last time the player cast Empower Bond.
   * Because the buffs produced by Kindred Spirits are fully symmetrical between the Druid and their
   * partner, there is no way to tell if the player empowered the bond or if the partner is a
   * Druid who empowered their bond. The only way to tell is to use the empower bond cast event,
   * and only attribute healing that happened within the buff duration of a player cast.
   */
  _lastEmpowerTimestamp: number | undefined = undefined;

  /** Amount of bonus healing due to Lone Meditation */
  loneMeditationHealing: number = 0;
  /** Amount you healed your partner w/ Kindred Focus */
  kindredFocusHealing: number = 0;
  /** Amount of heal and absorb procced by your DPS partner's damage */
  kindredEmpowermentPartnerHealing: number = 0;
  /** Amount of damage transferred to your Tank partner */
  kindredProtectionPartnerDamageTransfer: number = 0;
  /** Amount your healer partner healed you with Kindred Focus */
  kindredFocusPartnerHealing: number = 0;


  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.KYRIAN.id);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EMPOWER_BOND), this.onEmpower);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.LONE_MEDITATION), this.onMeditate);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.KINDRED_FOCUS_HEAL), this.onFocusHealPartner);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.KINDRED_EMPOWERMENT_DPS_HEAL), this.onEmpowermentHeal);
    this.addEventListener(Events.absorbed.to(this.selectedCombatant.id).spell(SPELLS.KINDRED_EMPOWERMENT_BUFF_ABSORB_INCOMING), this.onEmpowermentAbsorb);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.KINDRED_PROTECTION_BUFF), this.onProtectionDamage);
    this.addEventListener(Events.heal.to(this.selectedCombatant.id).spell(SPELLS.KINDRED_FOCUS_HEAL), this.onFocusHealPlayer);
  }

  onHeal(event: HealEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.LONE_MEDITATION.id)) {
      this.loneMeditationHealing += calculateEffectiveHealing(event, LONE_MEDITATION_BOOST);
    }
  }

  onEmpower(event: CastEvent) {
    this._empowerCasts += 1;
    this._lastEmpowerTimestamp = event.timestamp;
  }

  onMeditate(_: CastEvent) {
    this._meditateCasts += 1;
  }

  onFocusHealPartner(event: HealEvent) {
    if (this._isPlayerEmpowered()) {
      this.kindredFocusHealing += event.amount + (event.absorbed || 0);
    }
  }

  onEmpowermentHeal(event: HealEvent) {
    if (this._isPlayerEmpowered()) {
      this.kindredEmpowermentPartnerHealing += event.amount + (event.absorbed || 0);
    }
  }

  onEmpowermentAbsorb(event: AbsorbedEvent) {
    if (this._isPlayerEmpowered()) {
      this.kindredEmpowermentPartnerHealing += event.amount;
    }
  }

  onProtectionDamage(event: DamageEvent) {
    if (this._isPlayerEmpowered()) {
      this.kindredProtectionPartnerDamageTransfer += event.amount + (event.absorbed);
    }
  }

  onFocusHealPlayer(event: HealEvent) {
    if (this._isPlayerEmpowered()) {
      this.kindredFocusPartnerHealing += event.amount + (event.absorbed);
    }
  }

  _isPlayerEmpowered(): boolean {
    return this._lastEmpowerTimestamp && this._lastEmpowerTimestamp + KINDRED_SPIRITS_DURATION > this.owner.currentTimestamp;
  }

  get totalHealing(): number {
    return this.kindredFocusHealing + this.kindredEmpowermentPartnerHealing +
      this.kindredFocusPartnerHealing + this.loneMeditationHealing;
  }

  get totalCasts(): number {
    return this._empowerCasts + this._meditateCasts;
  }

  statistic() {
    const displaySpell = this._empowerCasts ? SPELLS.KINDRED_SPIRITS : SPELLS.LONE_MEDITATION;
    let castString = " Kindred Spirits";
    if (this._empowerCasts && this._meditateCasts) {
      castString = " Empower Bond and Lone Meditation";
    } else if (this._empowerCasts) {
      castString = " Empower Bond";
    } else if (this._meditateCasts) {
      castString = " Lone Meditation";
    }

    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(0)}
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            This is the sum of all healing you caused with{castString}. You averaged
            <strong>{formatNumber(this.totalHealing / this.totalCasts)} healing per cast</strong>.
            <ul>
              {this.kindredFocusHealing > 0 &&
                <li>
                  Focus Healing on Partner: <strong>{this.owner.formatItemHealingDone(this.kindredFocusHealing)}</strong>
                </li>
              }
              {this.kindredEmpowermentPartnerHealing > 0 &&
                <li>
                  Healing/Absorb from Partner's Damage: <strong>{this.owner.formatItemHealingDone(this.kindredEmpowermentPartnerHealing)}</strong>
                </li>
              }
              {this.kindredProtectionPartnerDamageTransfer > 0 &&
                <li>
                  Damage Transferred to Tank Partner (not counted in total): <strong>{this.owner.formatItemHealingDone(this.kindredProtectionPartnerDamageTransfer)}</strong>
                </li>
              }
              {this.kindredFocusPartnerHealing > 0 &&
                <li>
                  Partner Focus Healing on You: <strong>{this.owner.formatItemHealingDone(this.kindredFocusPartnerHealing)}</strong>
                </li>
              }
              {this.loneMeditationHealing > 0 &&
                <li>
                  Lone Meditation Healing: <strong>{this.owner.formatItemHealingDone(this.loneMeditationHealing)}</strong>
                </li>
              }
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={displaySpell}>
          <ItemPercentHealingDone amount={this.totalHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}


export default KindredSpiritsResto;
