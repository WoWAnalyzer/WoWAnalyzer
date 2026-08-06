import TALENTS from 'common/TALENTS/paladin';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import SPECS from 'game/SPECS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  FightEndEvent,
  CastEvent,
  ApplyBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';

const ZEALOTS_PARAGON_EXTENSION_MS = 500;
const AW_BUFF_IDS = [TALENTS.AVENGING_WRATH_TALENT.id, TALENTS.SENTINEL_TALENT.id];

class HammerofWrath extends ExecuteHelper {
  static dependencies = {
    ...ExecuteHelper.dependencies,
    abilities: Abilities,
  };

  protected abilities!: Abilities;

  static executeSpells: Spell[] = [SPELLS.HAMMER_OF_WRATH_CAST];
  static executeSources: number = SELECTED_PLAYER;
  static lowerThreshold = 0;
  static executeOutsideRangeEnablers: Spell[] = [
    TALENTS.AVENGING_WRATH_TALENT,
    TALENTS.SENTINEL_TALENT,
    TALENTS.AVENGING_CRUSADER_TALENT,
    TALENTS.CRUSADE_TALENT,
  ];
  static modifiesDamage = false;
  static countCooldownAsExecuteTime = false;

  get lowerThreshold() {
    return this.selectedCombatant.specId === SPECS.PROTECTION_PALADIN.id ? 0 : 0.2;
  }

  maxCasts = 0;

  private zealotsParagonRank = 0;
  private isAWActive = false;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.fightend, this.adjustMaxCasts);

    const specId = this.selectedCombatant.specId;
    const isProtection = specId === SPECS.PROTECTION_PALADIN.id;
    const baseCD = isProtection ? 5 : specId === SPECS.RETRIBUTION_PALADIN.id ? 11 : 6;

    (options.abilities as Abilities).add({
      spell: SPELLS.HAMMER_OF_WRATH_CAST.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      cooldown: (haste: number) => baseCD / (1 + haste),
      gcd: { base: 1500 },
      charges: this.selectedCombatant.hasTalent(TALENTS.CRUSADERS_JUDGMENT_TALENT) ? 2 : 1,
      castEfficiency: {
        suggestion: specId !== SPECS.HOLY_PALADIN.id,
        recommendedEfficiency: this.selectedCombatant.hasTalent(TALENTS.VENERATION_TALENT)
          ? 0.75
          : 0.85,
        maxCasts: () => this.maxCasts,
      },
    });

    this.zealotsParagonRank = this.selectedCombatant.getTalentRank(TALENTS.ZEALOTS_PARAGON_TALENT);
    if (this.zealotsParagonRank > 0) {
      this.addEventListener(
        Events.cast
          .by(SELECTED_PLAYER)
          .spell([
            { id: SPELLS.JUDGMENT_CAST_PROTECTION.id },
            { id: SPELLS.HAMMER_OF_WRATH_CAST.id },
          ]),
        this.onExtendingCast,
      );

      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(AW_BUFF_IDS.map((id) => ({ id }))),
        this.onAWApplied,
      );
      this.addEventListener(
        Events.removebuff.by(SELECTED_PLAYER).spell(AW_BUFF_IDS.map((id) => ({ id }))),
        this.onAWRemoved,
      );
    }
  }

  private onAWApplied(_event: ApplyBuffEvent) {
    this.isAWActive = true;
  }

  private onAWRemoved(_event: RemoveBuffEvent) {
    this.isAWActive = false;
  }

  private onExtendingCast(_event: CastEvent) {
    if (this.isAWActive) {
      this.totalExecuteWindowDuration += this.zealotsParagonRank * ZEALOTS_PARAGON_EXTENSION_MS;
    }
  }

  adjustMaxCasts(event: FightEndEvent) {
    if (this.selectedCombatant.specId === SPECS.PROTECTION_PALADIN.id) {
      let totalBuffUptime = 0;
      for (const buffId of AW_BUFF_IDS) {
        totalBuffUptime += this.selectedCombatant.getBuffUptime(buffId);
      }
      const ability = this.abilities.getAbility(SPELLS.HAMMER_OF_WRATH_CAST.id);
      const cooldownMs = (ability?.cooldown ?? 0) * 1000;
      if (cooldownMs > 0) {
        this.maxCasts = Math.ceil((totalBuffUptime + this.totalExecuteWindowDuration) / cooldownMs);
      }
      return;
    }

    const ability = this.abilities.getAbility(SPELLS.HAMMER_OF_WRATH_CAST.id);
    const cooldownMs = (ability?.cooldown ?? 0) * 1000;
    super.onFightEnd(event);
    this.maxCasts += Math.ceil(this.totalExecuteDuration / cooldownMs);
  }
}

export default HammerofWrath;
