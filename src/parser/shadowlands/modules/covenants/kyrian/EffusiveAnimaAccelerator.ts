import SPELLS from 'common/SPELLS';
import { CLASSES, getClassBySpecId } from 'game/CLASSES';
import SOULBINDS from 'game/shadowlands/SOULBINDS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ApplyDebuffEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';

interface SpellInfo {
  id: number;
  name: string;
}

const SPELLS_BY_CLASS: { [key: number]: SpellInfo } = {
  [CLASSES.DEATH_KNIGHT]: SPELLS.SHACKLE_THE_UNWORTHY,
  [CLASSES.DEMON_HUNTER]: SPELLS.ELYSIAN_DECREE,
  [CLASSES.DRUID]: SPELLS.KINDRED_SPIRITS,
  [CLASSES.HUNTER]: SPELLS.RESONATING_ARROW,
  [CLASSES.MAGE]: SPELLS.RADIANT_SPARK,
  [CLASSES.MONK]: SPELLS.WEAPONS_OF_ORDER_CAST,
  [CLASSES.PALADIN]: SPELLS.DIVINE_TOLL,
  [CLASSES.PRIEST]: SPELLS.BOON_OF_THE_ASCENDED,
  [CLASSES.ROGUE]: SPELLS.ECHOING_REPRIMAND,
  [CLASSES.SHAMAN]: SPELLS.VESPER_TOTEM,
  [CLASSES.WARLOCK]: SPELLS.SCOURING_TITHE,
  [CLASSES.WARRIOR]: SPELLS.SPEAR_OF_BASTION,
};

// Each stack of Effusive Anima Accelerator refunds 1/15 of the cooldown, up to a maximum of 5 times.
// E.g. for a 1 minute cooldown, you get 4s per stack up to 20s.
// Warlock base cd is 40s which isn't evenly divisible, this one is rounded up to 3s per stack up to 15s.
const CDR_PER_APPLICATION = 1 / 15;
const MAX_CDR_APPLICATIONS = 5;

const debug = false;

class EffusiveAnimaAccelerator extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
  };

  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;

  // Array of triggering cast and number of debuff applications
  casts: Array<[CastEvent, number]> = [];
  classAbility: SpellInfo;

  constructor(options: Options) {
    super(options);

    const classId = getClassBySpecId(this.selectedCombatant.specId);
    this.classAbility = SPELLS_BY_CLASS[classId];

    // shouldn't be possible, but we don't actually have proper typechecks on
    // the SPELLS table so a typo etc can cause it
    if (this.classAbility === undefined) {
      throw new Error('No Kyrian ability defined for class.');
    }

    const active = this.selectedCombatant.hasSoulbind(SOULBINDS.FORGELITE_PRIME_MIKANIKOS.id);

    this.active = active;
    if (!active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.classAbility), this.onCast);
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.EFFUSIVE_ANIMA_ACCELERATOR),
      this.onDebuff,
    );
  }

  onCast(event: CastEvent) {
    this.casts.push([event, 0]);
  }

  onDebuff(event: ApplyDebuffEvent) {
    if (this.casts.length === 0) {
      debug &&
        this.warn(event.ability.name, 'applied before first', this.classAbility.name, 'cast');
      return;
    }
    const [lastCast, applications] = this.casts[this.casts.length - 1];
    const baseCd = this.abilities.getExpectedCooldownDuration(lastCast.ability.guid, lastCast);
    if (baseCd == null) {
      debug && this.warn('no cd for', lastCast.ability.name);
      return;
    }

    if (applications >= MAX_CDR_APPLICATIONS) {
      return;
    }

    if (this.spellUsable.isOnCooldown(lastCast.ability.guid)) {
      this.spellUsable.reduceCooldown(
        lastCast.ability.guid,
        Math.ceil(baseCd * CDR_PER_APPLICATION),
      );
    }
    this.casts[this.casts.length - 1][1] = applications + 1;
  }
}

export default EffusiveAnimaAccelerator;
