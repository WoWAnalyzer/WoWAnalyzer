import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import { AGONIZING_FLAMES_VENGEANCE_TALENT } from 'common/TALENTS/demonhunter';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { Options } from 'parser/core/EventSubscriber';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

//WCL: https://www.warcraftlogs.com/reports/JxyY7HCDcjqMA9tf/#fight=1&source=15
export default class AgonizingFlames extends Analyzer {
  extendedImmolationAuraDamage = 0;
  lastCast = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(AGONIZING_FLAMES_VENGEANCE_TALENT.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.IMMOLATION_AURA),
      this.onImmolationAuraCast,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.IMMOLATION_AURA_BUFF_DAMAGE),
      this.onDamage,
    );
  }

  onImmolationAuraCast(event: CastEvent) {
    this.lastCast = event.timestamp;
  }

  onDamage(event: DamageEvent) {
    // IA precast before combat start
    if (this.lastCast === 0) {
      return;
    }

    // base duration, can be ignored
    if (event.timestamp - this.lastCast <= 6000) {
      return;
    }

    this.extendedImmolationAuraDamage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(9)}
        size="flexible"
        tooltip={
          <>
            This shows the extra dps that the talent provides.
            <br />
            <strong>Total extra damage:</strong> {formatNumber(this.extendedImmolationAuraDamage)}
          </>
        }
      >
        <BoringSpellValueText spellId={AGONIZING_FLAMES_VENGEANCE_TALENT.id}>
          <ItemDamageDone amount={this.extendedImmolationAuraDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
