import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { DamageEvent, EventType } from 'parser/core/Events';
import Events from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Enemies from 'parser/shared/modules/Enemies';
import EventHistory from 'parser/shared/modules/EventHistory';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

import { PHANTASMAL_PATHOGEN_DAMAGE_PER_RANK } from '../../constants';

class PhantasmalPathogen extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    eventHistory: EventHistory,
  };
  protected enemies!: Enemies;
  protected eventHistory!: EventHistory;

  castSA = 0;

  phantasmalPathogenMultiplier =
    this.selectedCombatant.getTalentRank(TALENTS.INSIDIOUS_IRE_TALENT) *
    PHANTASMAL_PATHOGEN_DAMAGE_PER_RANK;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHADOWY_APPARITION_CAST),
      this.onCastSA,
    );
  }

  onCastSA() {
    this.castSA += 1;
  }

  phantasmalPathogen() {
    const spell = SPELLS.SHADOWY_APPARITION_DAMAGE;
    const damageInstances = this.eventHistory.getEvents(EventType.Damage, {
      spell,
    });

    const [pathogen, unpathogen] = damageInstances.reduce<[DamageEvent[], DamageEvent[]]>(
      (result, damage) => {
        const enemy = this.enemies.getEntity(damage);
        const wasDP = enemy && enemy.hasBuff(TALENTS.DEVOURING_PLAGUE_TALENT.id, damage.timestamp);
        result[wasDP ? 0 : 1].push(damage);
        return result;
      },
      [[], []],
    );

    return {
      instancesHit: pathogen.length,
      instancesMissed: unpathogen.length,
      efficiency: pathogen.length / (pathogen.length + unpathogen.length),
      damageGained: pathogen.reduce(
        (sum, damage) => sum + calculateEffectiveDamage(damage, this.phantasmalPathogenMultiplier),
        0,
      ),
    };
  }

  //this is used in ShadowyApparitions to show all Apparition Talents together
  statisticSubsection() {
    return (
      <BoringSpellValueText spell={TALENTS.PHANTASMAL_PATHOGEN_TALENT}>
        <div>
          <ItemDamageDone amount={this.phantasmalPathogen().damageGained} />
        </div>
        <div>
          <>{this.phantasmalPathogen().instancesHit}</>{' '}
          <small>empowered spirits out of {this.castSA} total</small>
        </div>
      </BoringSpellValueText>
    );
  }
}

export default PhantasmalPathogen;
