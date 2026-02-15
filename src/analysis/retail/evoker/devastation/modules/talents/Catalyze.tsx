import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent } from 'parser/core/Events';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import Enemies from 'parser/shared/modules/Enemies';

class Catalyze extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  fireBreathDamageDuringDisintegrate = 0;
  extraDamageFromCatalyze = 0;
  fireBreathTicks = 0;
  extraTicksFromCatalyze = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.CATALYZE_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FIRE_BREATH_DOT),
      this.onHit,
    );
  }

  onHit(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.DISINTEGRATE.id, event.timestamp)) return;

    this.fireBreathTicks += 1;
    this.fireBreathDamageDuringDisintegrate += event.amount + (event.absorbed ?? 0);
  }

  statistic() {
    this.extraDamageFromCatalyze = this.fireBreathDamageDuringDisintegrate / 2;
    this.extraTicksFromCatalyze = this.fireBreathTicks / 2;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>Damage: {formatNumber(this.extraDamageFromCatalyze)}</li>
            <li>Extra ticks gained: {Math.floor(this.extraTicksFromCatalyze)}</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.CATALYZE_TALENT}>
          <ItemDamageDone amount={this.extraDamageFromCatalyze} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Catalyze;
