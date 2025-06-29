import { formatPercentage, formatThousands } from 'common/format';
import TALENTS from 'common/TALENTS/warlock';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import MAGIC_SCHOOLS, { isMatchingDamageType } from 'game/MAGIC_SCHOOLS';

const WICKED_MAW_DEBUFF_ID = 270569;

class WickedMaw extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  enemies!: Enemies;

  wickedMawDamage = 0;
  shadowtouchedDamage = 0;
  totalDamage = 0;

  wickedMawHits = 0;
  shadowtouchedHits = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.WICKED_MAW_TALENT);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onPlayerDamage);
    // Only track pet damage if shadowtouched is present
    if (this.selectedCombatant.hasTalent(TALENTS.SHADOWTOUCHED_TALENT)) {
      this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
    }
  }

  onPlayerDamage(event: DamageEvent) {
    this.totalDamage += event.amount + (event.absorbed || 0);

    const enemy = this.enemies.getEntity(event);
    if (enemy && enemy.hasBuff(WICKED_MAW_DEBUFF_ID)) {
      // Only apply to Shadowflame damage (Shadow or Fire)
      const isShadowFlame =
        isMatchingDamageType(event.ability.type, MAGIC_SCHOOLS.ids.SHADOW) ||
        isMatchingDamageType(event.ability.type, MAGIC_SCHOOLS.ids.FIRE);
      if (!isShadowFlame) {
        return;
      }

      // Calculate Wicked Maw damage increase (20% additional Shadowflame damage to debuffed enemies)
      this.wickedMawDamage += calculateEffectiveDamage(event, 0.2);
      this.wickedMawHits++;
    }
  }

  onPetDamage(event: DamageEvent) {
    this.totalDamage += event.amount + (event.absorbed || 0);

    const enemy = this.enemies.getEntity(event);
    if (enemy && enemy.hasBuff(WICKED_MAW_DEBUFF_ID)) {
      // Only apply to Shadow damage for Shadowtouched
      if (!isMatchingDamageType(event.ability.type, MAGIC_SCHOOLS.ids.SHADOW)) {
        return;
      }

      // Shadowtouched: Additional 20% Shadow damage from demons to Wicked Maw targets
      this.shadowtouchedDamage += calculateEffectiveDamage(event, 0.2);
      this.shadowtouchedHits++;
    }
  }

  get combinedDamageIncrease() {
    return this.wickedMawDamage + this.shadowtouchedDamage;
  }

  get damageIncreasePercentage() {
    if (this.totalDamage === 0) return 0;
    return this.combinedDamageIncrease / this.totalDamage;
  }

  get wickedMawUptime() {
    return this.enemies.getBuffUptime(WICKED_MAW_DEBUFF_ID) / this.owner.fightDuration;
  }

  statistic() {
    if (!this.active) return null;

    const hasShadowtouched = this.selectedCombatant.hasTalent(TALENTS.SHADOWTOUCHED_TALENT);

    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            <strong>Wicked Maw{hasShadowtouched ? ' & Shadowtouched' : ''}:</strong>
            <br />
            {formatThousands(this.combinedDamageIncrease)} additional damage from{' '}
            {hasShadowtouched ? 'these talents' : 'this talent'}
            <br />
            <br />
            <SpellLink spell={TALENTS.WICKED_MAW_TALENT} />: {formatThousands(this.wickedMawDamage)}{' '}
            damage ({this.wickedMawHits} enhanced hits)
            <br />
            {hasShadowtouched && (
              <>
                <SpellLink spell={TALENTS.SHADOWTOUCHED_TALENT} />:{' '}
                {formatThousands(this.shadowtouchedDamage)} damage ({this.shadowtouchedHits}{' '}
                enhanced hits)
                <br />
              </>
            )}
            <br />
            Wicked Maw uptime: {formatPercentage(this.wickedMawUptime)}%
            {hasShadowtouched && (
              <>
                <br />
                <br />
                <strong>Note:</strong> Shadowtouched requires Wicked Maw debuff to function.
              </>
            )}
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.WICKED_MAW_TALENT}>
          <ItemDamageDone amount={this.combinedDamageIncrease} />
          <br />
          {formatPercentage(this.damageIncreasePercentage)}% <small>damage increase</small>
          <br />
          <small>{formatPercentage(this.wickedMawUptime)}% debuff uptime</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WickedMaw;
