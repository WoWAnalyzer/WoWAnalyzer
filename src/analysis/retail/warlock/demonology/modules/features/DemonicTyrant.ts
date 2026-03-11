import SPELLS from 'common/SPELLS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Analyzer from 'parser/core/Analyzer';
import Events, { CastEvent, SummonEvent } from 'parser/core/Events';

export default class DemonicTyrant extends Analyzer {
  tyrantData: TyrantCastData[] = [];
  currentTyrant: TyrantCastData | null = null;

  lastDreadstalkersCast = 0;

  constructor(options: Options) {
    super(options);

    // Tyrant cast
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SUMMON_DEMONIC_TYRANT),
      (event) => this.onTyrantCast(event),
    );

    // Hand of Gul'dan cast
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HAND_OF_GULDAN_CAST),
      (event) => this.onHandOfGuldanCast(event),
    );

    // Wild imp summons (spell name may vary in the repo)
    // If this errors later we will fix the spell constant
    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(SPELLS.WILD_IMP_HOG_SUMMON),
      (event) => this.onImpSummon(event),
    );
    // Dreadstalkers cast
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CALL_DREADSTALKERS),
      (event) => this.onDreadstalkersCast(event),
    );
  }

  onTyrantCast = (event: CastEvent) => {
    const timeSinceDreadstalkers = event.timestamp - this.lastDreadstalkersCast;

    const dreadstalkersActive = timeSinceDreadstalkers <= DREADSTALKERS_DURATION;

    const dreadstalkersTooEarly = dreadstalkersActive && timeSinceDreadstalkers > DREADSTALKERS_EARLY_CUTOFF_MS;

    const tyrant: TyrantCastData = {
      cast: event.timestamp,
      handOfGuldanCasts: 0,
      impsSummoned: 0,
      dreadstalkersActive,
      dreadstalkersTooEarly,
    };

    this.tyrantData.push(tyrant);
    this.currentTyrant = tyrant;
  };

  onHandOfGuldanCast = (event: CastEvent) => {
    if (!this.currentTyrant) {
      return;
    }

    if (event.timestamp > this.currentTyrant.cast + 20000) {
      this.currentTyrant = null;
      return;
    }

    this.currentTyrant.handOfGuldanCasts += 1;
  };

  onImpSummon = (event: SummonEvent) => {
    if (!this.currentTyrant) {
      return;
    }

    if (event.timestamp > this.currentTyrant.cast + 20000) {
      this.currentTyrant = null;
      return;
    }

    this.currentTyrant.impsSummoned += 1;
  };
  onDreadstalkersCast = (event: CastEvent) => {
    this.lastDreadstalkersCast = event.timestamp;
  };
}

export interface TyrantCastData {
  cast: number;
  handOfGuldanCasts: number;
  impsSummoned: number;
  dreadstalkersActive: boolean;
  dreadstalkersTooEarly: boolean;
}
