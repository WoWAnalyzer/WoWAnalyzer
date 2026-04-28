import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import AuspiciousSpirits from '../talents/AuspiciousSpirits';
import TormentedSpirits from '../talents/TormentedSpirits';
import SpectralHorrors from '../talents/SpectralHorrors';
import HauntingShadows from '../talents/HauntingShadows';
import PhantomMenace from '../talents/PhatomMenace';

class ShadowyApparitions extends Analyzer {
  static dependencies = {
    auspiciousSpirits: AuspiciousSpirits,
    tormentedSpirits: TormentedSpirits,
    spectralHorrors: SpectralHorrors,
    hauntingShadows: HauntingShadows,
    phantomMenace: PhantomMenace,
  };
  protected auspiciousSpirits!: AuspiciousSpirits;
  protected tormentedSpirits!: TormentedSpirits;
  protected spectralHorrors!: SpectralHorrors;
  protected hauntingShadows!: HauntingShadows;
  protected phantomMenace!: PhantomMenace;

  damage = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOWY_APPARITION_DAMAGE),
      this.onApparitionDamage,
    );
  }

  onApparitionDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  //this statistic includes all talents that impact Apparitions
  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip="Total damage done by Shadowy Apparitions with talents"
      >
        <BoringSpellValueText spell={TALENTS.SHADOWY_APPARITIONS_TALENT}>
          <div>
            <ItemDamageDone amount={this.damage} />
          </div>
        </BoringSpellValueText>

        {this.selectedCombatant.hasTalent(TALENTS.AUSPICIOUS_SPIRITS_TALENT)
          ? this.auspiciousSpirits.subStatistic()
          : null}

        {this.selectedCombatant.hasTalent(TALENTS.TORMENTED_SPIRITS_TALENT)
          ? this.tormentedSpirits.subStatistic()
          : null}

        {this.selectedCombatant.hasTalent(TALENTS.SPECTRAL_HORRORS_TALENT)
          ? this.spectralHorrors.subStatistic()
          : null}

        {this.selectedCombatant.hasTalent(TALENTS.HAUNTING_SHADOWS_TALENT)
          ? this.hauntingShadows.subStatistic()
          : null}

        {this.selectedCombatant.hasTalent(TALENTS.PHANTOM_MENACE_TALENT)
          ? this.phantomMenace.subStatistic()
          : null}
      </Statistic>
    );
  }
}

export default ShadowyApparitions;
