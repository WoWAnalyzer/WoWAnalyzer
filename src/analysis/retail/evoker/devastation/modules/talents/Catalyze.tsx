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

const { DISINTEGRATE, FIRE_BREATH_DOT } = SPELLS;

class Catalyze extends Analyzer {
  fireBreathDamageDuringDisintegrate: number = 0;
  disintegrateDebuffActive: boolean = false;
  extraDamageFromCatalyze: number = 0;
  fireBreathTicks: number = 0;
  extraTicksFromCatalyze: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.CATALYZE_TALENT);

    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(DISINTEGRATE), () => {
      this.disintegrateDebuffActive = true;
    });

    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(DISINTEGRATE), () => {
      this.disintegrateDebuffActive = false;
    });

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(FIRE_BREATH_DOT), this.onHit);
  }

  onHit(event: DamageEvent) {
    if (this.disintegrateDebuffActive) {
      this.fireBreathTicks += 1;
      this.fireBreathDamageDuringDisintegrate += event.amount;
      if (event.absorbed !== undefined) {
        this.fireBreathDamageDuringDisintegrate += event.absorbed;
      }
    }
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
