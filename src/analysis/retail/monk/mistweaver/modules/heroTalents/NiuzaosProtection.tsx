import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent, RemoveBuffEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class NiuzaosProtection extends Analyzer {
  talent = TALENTS_MONK.NIUZAOS_PROTECTION_TALENT;
  healing = 0;
  wasted = 0;
  shields = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(this.talent);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.NIUZAOS_PROTECTION_SHIELD),
      this.onApply,
    );
    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.NIUZAOS_PROTECTION_SHIELD),
      this.onAbsorbed,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.NIUZAOS_PROTECTION_SHIELD),
      this.onRemove,
    );
  }

  onApply() {
    this.shields += 1;
  }

  onAbsorbed(event: AbsorbedEvent) {
    this.healing += event.amount;
  }

  onRemove(event: RemoveBuffEvent) {
    this.wasted += event.absorb || 0;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <div>Shields: {this.shields}</div>
            <div>Wasted shield: {formatNumber(this.wasted)}</div>
          </>
        }
      >
        <TalentSpellText talent={this.talent}>
          <ItemHealingDone amount={this.healing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default NiuzaosProtection;
