import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import Events, { CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/shaman';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import SpellLink from 'interface/SpellLink';
import { SpellInfo } from 'parser/core/EventFilter';

class EchoesOfGreatSundering extends Analyzer {
  selectedSpender!: SpellInfo;
  earthquake!: SpellInfo;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ECHOES_OF_GREAT_SUNDERING_TALENT);
    if (!this.active) {
      return;
    }

    this.selectedSpender = this.selectedCombatant.hasTalent(TALENTS.EARTH_SHOCK_TALENT)
      ? TALENTS.EARTH_SHOCK_TALENT
      : TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT;
    this.earthquake = this.selectedCombatant.hasTalent(TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT)
      ? TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT
      : TALENTS.EARTHQUAKE_2_ELEMENTAL_TALENT;

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([this.selectedSpender, this.earthquake]),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    const hasEoGS = this.selectedCombatant.hasBuff(
      SPELLS.ECHOES_OF_GREAT_SUNDERING_BUFF.id,
      event.timestamp,
      100,
    );
    if (event.ability.guid === this.selectedSpender.id) {
      if (hasEoGS) {
        addInefficientCastReason(
          event,
          <>
            <SpellLink spell={this.selectedSpender.id} /> was cast with{' '}
            <SpellLink spell={TALENTS.ECHOES_OF_GREAT_SUNDERING_TALENT} />
          </>,
        );
      }
    } else {
      if (!hasEoGS) {
        addInefficientCastReason(
          event,
          <>
            <SpellLink spell={this.earthquake.id} /> was cast without{' '}
            <SpellLink spell={TALENTS.ECHOES_OF_GREAT_SUNDERING_TALENT} />
          </>,
        );
      }
    }
  }
}

export default EchoesOfGreatSundering;
