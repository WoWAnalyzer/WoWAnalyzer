import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import AtonementAnalyzer, { AtonementAnalyzerEvent } from '../core/AtonementAnalyzer';
import { HOLY_DAMAGE_SPELLS, SHADOW_DAMAGE_SPELLS } from '../../constants';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { SpellLink } from 'interface';

const TE_INCREASE = 0.15;

class TwilightEquilibrium extends Analyzer {
  healing = 0;
  damage = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.TWILIGHT_EQUILIBRIUM_TALENT.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.onAtone);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onAtone(event: AtonementAnalyzerEvent) {
    const { damageEvent } = event;
    if (
      !this.selectedCombatant.hasBuff(SPELLS.TWILIGHT_EQUILIBRIUM_HOLY_BUFF.id) &&
      !this.selectedCombatant.hasBuff(SPELLS.TWILIGHT_EQUILIBRIUM_SHADOW_BUFF.id)
    ) {
      return;
    }

    if (HOLY_DAMAGE_SPELLS.includes(damageEvent?.ability.guid ?? -1)) {
      this.handleHolyHeal(event);
    }

    if (SHADOW_DAMAGE_SPELLS.includes(damageEvent?.ability.guid ?? -1)) {
      this.handleShadowHeal(event);
    }
  }

  handleHolyHeal(event: AtonementAnalyzerEvent) {
    const { healEvent } = event;
    if (this.selectedCombatant.hasBuff(SPELLS.TWILIGHT_EQUILIBRIUM_HOLY_BUFF.id)) {
      this.healing += calculateEffectiveHealing(healEvent, TE_INCREASE);
    }
  }

  handleShadowHeal(event: AtonementAnalyzerEvent) {
    const { healEvent } = event;
    if (this.selectedCombatant.hasBuff(SPELLS.TWILIGHT_EQUILIBRIUM_SHADOW_BUFF.id)) {
      this.healing += calculateEffectiveHealing(healEvent, TE_INCREASE);
    }
  }

  onDamage(event: DamageEvent) {
    if (
      !this.selectedCombatant.hasBuff(SPELLS.TWILIGHT_EQUILIBRIUM_HOLY_BUFF.id) &&
      !this.selectedCombatant.hasBuff(SPELLS.TWILIGHT_EQUILIBRIUM_SHADOW_BUFF.id)
    ) {
      return;
    }

    if (HOLY_DAMAGE_SPELLS.includes(event?.ability.guid ?? -1)) {
      if (this.selectedCombatant.hasBuff(SPELLS.TWILIGHT_EQUILIBRIUM_HOLY_BUFF.id)) {
        this.damage += calculateEffectiveDamage(event, TE_INCREASE);
      }
    }

    if (SHADOW_DAMAGE_SPELLS.includes(event?.ability.guid ?? -1)) {
      if (this.selectedCombatant.hasBuff(SPELLS.TWILIGHT_EQUILIBRIUM_SHADOW_BUFF.id)) {
        this.damage += calculateEffectiveDamage(event, TE_INCREASE);
      }
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This module represents the healing of{' '}
            <SpellLink id={TALENTS_PRIEST.TWILIGHT_EQUILIBRIUM_TALENT.id} />. The talent is
            currently subject to a large number of bugs. If the buff is procced in the spell queue
            window, it will consume the buff but not amplify the spell. If using{' '}
            <SpellLink id={TALENTS_PRIEST.DIVINE_AEGIS_TALENT.id} />, any procs of this buff will
            immediately consume either Twilight Equilibrium stack.
          </>
        }
      >
        <>
          <BoringSpellValueText spellId={TALENTS_PRIEST.TWILIGHT_EQUILIBRIUM_TALENT.id}>
            <ItemHealingDone amount={this.healing} /> <br />
            <ItemDamageDone amount={this.damage} />
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default TwilightEquilibrium;
