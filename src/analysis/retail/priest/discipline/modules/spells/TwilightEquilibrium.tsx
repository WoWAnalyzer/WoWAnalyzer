import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyDebuffEvent,
  CastEvent,
  DamageEvent,
  RefreshDebuffEvent,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import AtonementAnalyzer, { AtonementAnalyzerEvent } from '../core/AtonementAnalyzer';
import { HOLY_DAMAGE_SPELLS, SHADOW_DAMAGE_SPELLS } from '../../constants';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';

const TE_INCREASE = 0.15;

class TwilightEquilibrium extends Analyzer {
  healing = 0;
  damage = 0;
  ptwTargets: Set<string> = new Set<string>();
  constructor(options: Options) {
    super(options);

    this.active = false;
    // this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.TWILIGHT_EQUILIBRIUM_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.onAtone);
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell([SPELLS.PURGE_THE_WICKED_TALENT]),
      this.onPTWApply,
    );

    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.PURGE_THE_WICKED_BUFF),
      this.onPTWApply,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PURGE_THE_WICKED_BUFF),
      this.onPTWDotDamage,
    );
  }

  onAtone(event: AtonementAnalyzerEvent) {
    const { damageEvent, healEvent } = event;

    if (damageEvent?.ability.guid === SPELLS.PURGE_THE_WICKED_BUFF.id) {
      if (this.ptwTargets.has(encodeEventTargetString(damageEvent) || '')) {
        this.healing += calculateEffectiveHealing(healEvent, TE_INCREASE);
      }
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
      HOLY_DAMAGE_SPELLS.includes(event?.ability.guid ?? -1) &&
      this.selectedCombatant.hasBuff(SPELLS.TWILIGHT_EQUILIBRIUM_HOLY_BUFF.id)
    ) {
      this.damage += calculateEffectiveDamage(event, TE_INCREASE);
    }

    if (
      SHADOW_DAMAGE_SPELLS.includes(event?.ability.guid ?? -1) &&
      this.selectedCombatant.hasBuff(SPELLS.TWILIGHT_EQUILIBRIUM_SHADOW_BUFF.id)
    ) {
      this.damage += calculateEffectiveDamage(event, TE_INCREASE);
    }
  }

  onPTWApply(event: CastEvent | RefreshDebuffEvent | ApplyDebuffEvent) {
    const targetString = encodeEventTargetString(event) || '';
    if (this.selectedCombatant.hasBuff(SPELLS.TWILIGHT_EQUILIBRIUM_HOLY_BUFF.id)) {
      this.ptwTargets.add(targetString);
    } else {
      this.ptwTargets.delete(targetString);
    }
  }

  onPTWDotDamage(event: DamageEvent) {
    if (this.ptwTargets.has(encodeEventTargetString(event) || '')) {
      this.damage += calculateEffectiveDamage(event, TE_INCREASE);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
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
