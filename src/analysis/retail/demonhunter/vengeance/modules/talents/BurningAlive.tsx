import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

//WCL: https://www.warcraftlogs.com/reports/JxyY7HCDcjqMA9tf/#fight=1&source=15
class BurningAlive extends Analyzer {
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.BURNING_ALIVE_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FIERY_BRAND_DOT),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            This shows the extra dps that the talent provides.
            <br />
            <strong>Total extra damage:</strong> {formatNumber(this.damage)}
          </>
        }
      >
        <TalentSpellText talent={TALENTS_DEMON_HUNTER.BURNING_ALIVE_TALENT}>
          <ItemDamageDone amount={this.damage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default BurningAlive;
