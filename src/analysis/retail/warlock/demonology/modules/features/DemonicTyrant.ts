import SPELLS from 'common/SPELLS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Analyzer from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';

export default class DemonicTyrant extends Analyzer {
  tyrantData: TyrantCastData[] = [];

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SUMMON_DEMONIC_TYRANT),
      this.onTyrantCast,
    );
  }

  onTyrantCast(event: CastEvent) {
    this.tyrantData.push({
      cast: event.timestamp,
    });
  }
}

export interface TyrantCastData {
  cast: number;
}
