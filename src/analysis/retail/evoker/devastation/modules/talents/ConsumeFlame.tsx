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
import { getConsumeFlameDamageLinkEvent } from '../normalizers/CastLinkNormalizer';
import DonutChart from 'parser/ui/DonutChart';

class ConsumeFlame extends Analyzer {
  totalDamage = 0;
  disintegrateDamage = 0;
  pyreDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.CONSUME_FLAME_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CONSUME_FLAME_DAMAGE),
      this.onHit,
    );
  }

  onHit(event: DamageEvent) {
    this.totalDamage += event.amount + (event.absorbed || 0);
    const consumeFlameDamageEvent = getConsumeFlameDamageLinkEvent(event);
    if (!consumeFlameDamageEvent) {
      return;
    }
    if (consumeFlameDamageEvent.ability.guid == SPELLS.DISINTEGRATE.id) {
      this.disintegrateDamage += event.amount + (event.absorbed || 0);
    } else {
      this.pyreDamage += event.amount + (event.absorbed || 0);
    }
  }

  statistic() {
    const damageItems = [
      {
        color: 'rgb(183,65,14)',
        label: 'Pyre',
        spellId: SPELLS.PYRE.id,
        valueTooltip: formatNumber(this.pyreDamage),
        value: this.pyreDamage,
      },
      {
        color: 'rgb(41,134,204)',
        label: 'Disintegrate',
        spellId: SPELLS.DISINTEGRATE.id,
        valueTooltip: formatNumber(this.disintegrateDamage),
        value: this.disintegrateDamage,
      },
    ];
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={<li>Damage: {formatNumber(this.totalDamage)}</li>}
      >
        <TalentSpellText talent={TALENTS.CONSUME_FLAME_TALENT}>
          <ItemDamageDone amount={this.totalDamage} />
        </TalentSpellText>

        <div className="pad">
          <label>Damage sources</label>
          <DonutChart items={damageItems} />
        </div>
      </Statistic>
    );
  }
}

export default ConsumeFlame;
