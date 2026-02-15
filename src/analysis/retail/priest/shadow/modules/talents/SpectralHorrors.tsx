import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { DamageEvent } from 'parser/core/Events';
import Events from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

import { SPECTRAL_HORROR_DAMAGE } from '../../constants';

class SpectralHorrors extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  castSA = 0;
  damage = 0;
  hits = 0;

  spectralHorrorsMultiplier =
    this.selectedCombatant.getTalentRank(TALENTS.INSIDIOUS_IRE_TALENT) * SPECTRAL_HORROR_DAMAGE;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SPECTRAL_HORRORS_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHADOWY_APPARITION_CAST),
      this.onCastSA,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOWY_APPARITION_DAMAGE),
      this.onApparitionDamage,
    );
  }

  onCastSA() {
    this.castSA += 1;
  }

  onApparitionDamage(event: DamageEvent) {
    const target = this.enemies.getEntity(event);

    if (target && target.hasBuff(TALENTS.SHADOW_WORD_MADNESS_TALENT.id, event.timestamp)) {
      this.hits += 1;
      this.damage += calculateEffectiveDamage(event, this.spectralHorrorsMultiplier);
    }
  }

  //this is used in ShadowyApparitions to show all Apparition Talents together
  subStatistic() {
    return (
      <BoringSpellValueText spell={TALENTS.SPECTRAL_HORRORS_TALENT}>
        <div>
          <ItemDamageDone amount={this.damage} />
        </div>
        <div>
          <>{this.hits}</> <small>empowered spirits out of {this.castSA} total</small>
        </div>
      </BoringSpellValueText>
    );
  }
}

export default SpectralHorrors;
