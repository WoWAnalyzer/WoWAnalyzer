import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Analyzer from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  ApplyDebuffEvent,
  RemoveDebuffEvent,
  DamageEvent,
} from 'parser/core/Events';
import Abilities from '../core/Abilities';
import { encodeTargetString } from 'parser/shared/modules/Enemies';

const EXECUTE_RANGE_THRESHOLD = 0.2;

export default class HavocAnalyzer extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  protected abilities!: Abilities;

  havocData: HavocWindowData[] = [];
  currentHavoc: HavocWindowData | null = null;
  executeRangeMap: Map<string, boolean> = new Map();

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
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.HAVOC),
      this.onHavocApplied,
    );

    // Havoc Removed (target died or debuff fell off)
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.HAVOC),
      this.onHavocRemoved,
    );

    // Spell casts during window
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent): void {
    if (event.targetIsFriendly) return;

    const targetString = encodeTargetString(event.targetID, event.targetInstance);
    const isExecute = (event.hitPoints ?? 1) / (event.maxHitPoints ?? 1) <= EXECUTE_RANGE_THRESHOLD;
    this.executeRangeMap.set(targetString, isExecute);
  }

  onHavocApplied(event: ApplyDebuffEvent): void {
    const havoc: HavocWindowData = {
      start: event.timestamp,
      end: event.timestamp + this.havocDuration,
      chaosBolts: 0,
      shadowburns: 0,
      shadowburnsInExecute: 0,
      casts: [], // store havocable casts
    };

    this.havocData.push(havoc);
    this.currentHavoc = havoc;
  }

  onHavocRemoved(event: RemoveDebuffEvent): void {
    if (!this.currentHavoc) return;

    const window = this.currentHavoc;

    // Detect early removal (target likely died)
    if (event.timestamp < window.start + this.havocDuration) {
      window.targetDied = true;
    }

    window.end = event.timestamp;
    this.currentHavoc = null;
  }

  onCast(event: CastEvent): void {
    if (!this.currentHavoc) return;

    const spellId = event.ability.guid;

    // Only count it if the ability is Havoc-able
    if (this.abilities.isHavocable(spellId)) {
      this.currentHavoc.casts.push(event);
    }

    if (spellId === SPELLS.CHAOS_BOLT.id) {
      this.currentHavoc.chaosBolts += 1;
    }

    if (spellId === TALENTS.SHADOWBURN_TALENT.id) {
      this.currentHavoc.shadowburns += 1;

      if (event.targetID !== undefined) {
        const targetString = encodeTargetString(event.targetID, event.targetInstance);
        if (this.executeRangeMap.get(targetString)) {
          this.currentHavoc.shadowburnsInExecute += 1;
        }
      }
    }
  }

  public getFormatTimestamp(): (timestamp: number) => string {
    return this.owner.formatTimestamp.bind(this.owner);
  }
}

export interface HavocWindowData {
  start: number;
  end?: number;
  chaosBolts: number;
  shadowburns: number;
  casts: CastEvent[]; // only tracks Havocable spells
  targetDied?: boolean;
  shadowburnsInExecute: number;
}
