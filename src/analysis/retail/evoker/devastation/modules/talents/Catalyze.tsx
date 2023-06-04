import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent } from 'parser/core/Events';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

const { DISINTEGRATE, FIRE_BREATH_FONT, FIRE_BREATH_DOT } = SPELLS;

class Catalyze extends Analyzer {
  fireBreathDamageDuringDisintegrate: number = 0;
  disintegrateDebuffActive: boolean = false;
  extraDamageFromCatalyze: number = 0;
  fireBreathTicks: number = 0;
  extraTicksFromCatalyze: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(DISINTEGRATE), () => {
      this.disintegrateDebuffActive = true;
    });

    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(DISINTEGRATE), () => {
      this.disintegrateDebuffActive = false;
    });

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FIRE_BREATH_DOT),
      this.onHit,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell([FIRE_BREATH_DOT, FIRE_BREATH_FONT]),
      () => {
        //this.extraDamageFromCatalyze = 0;
        //this.onHit;
        //console.log(event);
      },
    );
  }

  onHit(event: DamageEvent) {
    if (this.disintegrateDebuffActive) {
      this.fireBreathTicks += 1;
      this.fireBreathDamageDuringDisintegrate += event.amount;
    }
  }

  statistic() {
    this.extraDamageFromCatalyze = this.fireBreathDamageDuringDisintegrate / 2;
    this.extraTicksFromCatalyze = this.fireBreathTicks / 2;
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <BoringSpellValueText spellId={TALENTS.CATALYZE_TALENT.id}>
          <ItemDamageDone amount={this.extraDamageFromCatalyze} /> <br />
          <span style={{ fontSize: '65%' }}>
            {Math.floor(this.extraTicksFromCatalyze)} extra ticks gained.
          </span>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Catalyze;
