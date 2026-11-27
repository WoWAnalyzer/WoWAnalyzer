import SPELLS from 'common/SPELLS/paladin';
import TALENTS from 'common/TALENTS/paladin';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';

const VALOR_BUFFER_MS = 10;
export const OK_HOLY_POWER = 4;
const MAX_HOLY_POWER = 5;

export default class InstrumentOfTheDivine extends Analyzer {
  valorCasts: { timestamp: number; holyPower: number; divinePurpose: boolean }[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.INSTRUMENT_OF_THE_DIVINE_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_OF_THE_RIGHTEOUS),
      this.onShieldOfTheRighteous,
    );
  }

  get castsAtMax() {
    return this.valorCasts.filter((cast) => cast.holyPower >= MAX_HOLY_POWER);
  }

  private onShieldOfTheRighteous(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.VALOR.id, null, VALOR_BUFFER_MS)) {
      return;
    }
    const holyPower = event.classResources?.find(
      ({ type }) => type === RESOURCE_TYPES.HOLY_POWER.id,
    )?.amount;
    if (holyPower === undefined) {
      return;
    }
    this.valorCasts.push({
      timestamp: event.timestamp,
      holyPower,
      divinePurpose: this.selectedCombatant.hasBuff(
        SPELLS.DIVINE_PURPOSE_BUFF.id,
        null,
        VALOR_BUFFER_MS,
      ),
    });
  }
}
