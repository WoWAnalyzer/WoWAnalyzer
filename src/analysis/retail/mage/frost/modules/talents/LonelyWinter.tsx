import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const DAMAGE_BONUS = 0.25;
const BUFFED_SPELLS = [SPELLS.FROSTBOLT_DAMAGE, SPELLS.ICE_LANCE_DAMAGE, SPELLS.FLURRY_DAMAGE];

// You can no longer summon your Water Elemental, but Frostbolt, Ice Lance, and Flurry deal 25% increased damage.
class LonelyWinter extends Analyzer {
  bonusDamage: { [id: number]: number };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.LONELY_WINTER_TALENT.id);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(BUFFED_SPELLS),
      this.onAffectedDamage,
    );
    this.bonusDamage = {};
    BUFFED_SPELLS.forEach((spell) => {
      this.bonusDamage[spell.id] = 0;
    });
  }

  onAffectedDamage(event: DamageEvent) {
    this.bonusDamage[event.ability.guid] += calculateEffectiveDamage(event, DAMAGE_BONUS);
  }

  statistic() {
    let totalDamage = 0;
    const tooltip = Object.keys(this.bonusDamage).map((spellId) => {
      const spellBonus = this.bonusDamage[Number(spellId)];
      totalDamage += spellBonus;
      return (
        <li key={spellId}>
          Bonus <strong>{SPELLS[Number(spellId)].name}</strong> damage: {formatNumber(spellBonus)}
        </li>
      );
    });

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(90)}
        size="flexible"
        tooltip={
          <>
            When analyzing this talent, take into account any DPS you lost by not having a Water
            Elemental.
            <ul>{tooltip}</ul>
            Total damage increase: {formatNumber(totalDamage)}
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.LONELY_WINTER_TALENT.id}>
          {this.owner.formatItemDamageDone(totalDamage)}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default LonelyWinter;
