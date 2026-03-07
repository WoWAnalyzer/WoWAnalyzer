import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Analyzer from 'parser/core/Analyzer';
import Events, { CastEvent, ApplyDebuffEvent, RemoveDebuffEvent } from 'parser/core/Events';

export default class HavocAnalyzer extends Analyzer {
  havocData: HavocWindowData[] = [];
  currentHavoc: HavocWindowData | null = null;

  havocDuration = 15000;

  constructor(options: Options) {
    super(options);

    // Hide module if Havoc is not talented
    this.active = this.selectedCombatant.hasTalent(TALENTS.HAVOC_TALENT);

    // Improved Havoc extends duration
    if (this.selectedCombatant.hasTalent(TALENTS.IMPROVED_HAVOC_TALENT)) {
      this.havocDuration = 20000;
    }

    // Havoc Applied
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.HAVOC), (event) =>
      this.onHavocApplied(event),
    );

    // Havoc Removed (target died or debuff fell off)
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.HAVOC), (event) =>
      this.onHavocRemoved(event),
    );

    // Spell casts during window
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), (event) => this.onCast(event));
  }

  onHavocApplied = (event: ApplyDebuffEvent) => {
    const havoc: HavocWindowData = {
      start: event.timestamp,
      end: event.timestamp + this.havocDuration,
      chaosBolts: 0,
      shadowburns: 0,
      globals: 0,
    };

    this.havocData.push(havoc);
    this.currentHavoc = havoc;
  };

  onHavocRemoved = (event: RemoveDebuffEvent) => {
    if (!this.currentHavoc) {
      return;
    }

    const window = this.currentHavoc;

    // Detect early removal (target likely died)
    if (event.timestamp < window.start + this.havocDuration) {
      window.targetDied = true;
    }

    window.end = event.timestamp;
    this.currentHavoc = null;

    console.log('Havoc removed', {
      start: window.start,
      removed: event.timestamp,
      expected: window.start + this.havocDuration,
    });
  };

  onCast = (event: CastEvent) => {
    if (!this.currentHavoc) {
      return;
    }

    // If outside window duration, end it
    if (event.timestamp > this.currentHavoc.start + this.havocDuration) {
      this.currentHavoc.end = this.currentHavoc.start + this.havocDuration;
      this.currentHavoc = null;
      return;
    }

    this.currentHavoc.globals += 1;

    if (event.ability.guid === SPELLS.CHAOS_BOLT.id) {
      this.currentHavoc.chaosBolts += 1;
    }

    if (event.ability.guid === TALENTS.SHADOWBURN_TALENT.id) {
      this.currentHavoc.shadowburns += 1;
    }
  };
}

export interface HavocWindowData {
  start: number;
  end?: number;
  chaosBolts: number;
  shadowburns: number;
  globals: number;
  targetDied?: boolean;
}
