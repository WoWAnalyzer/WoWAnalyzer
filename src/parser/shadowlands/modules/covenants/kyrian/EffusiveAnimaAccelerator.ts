import SPELLS from 'common/SPELLS';
import { CLASSES, getClassBySpecId } from 'game/CLASSES';
import COVENANTS from 'game/shadowlands/COVENANTS';
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
  [CLASSES.MONK]: SPELLS.WEAPONS_OF_ORDER,
  [CLASSES.PALADIN]: SPELLS.DIVINE_TOLL,
  [CLASSES.PRIEST]: SPELLS.BOON_OF_THE_ASCENDED,
  [CLASSES.ROGUE]: SPELLS.ECHOING_REPRIMAND,
  [CLASSES.SHAMAN]: SPELLS.VESPER_TOTEM,
  [CLASSES.WARLOCK]: SPELLS.SCOURING_TITHE,
  [CLASSES.WARRIOR]: SPELLS.SPEAR_OF_BASTION,
};

const debug = false;

class EffusiveAnimaAccelerator extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
  };

  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;

  // Array of triggering cast and CDR in milliseconds.
  casts: Array<[CastEvent, number]> = [];
  classAbility: SpellInfo;

  constructor(options: Options) {
    super(options);

    const classId = getClassBySpecId(this.selectedCombatant.specId);
    this.classAbility = SPELLS_BY_CLASS[classId];

    const active =
      classId < Infinity &&
      this.classAbility != null &&
      this.selectedCombatant.hasCovenant(COVENANTS.KYRIAN.id) &&
      this.selectedCombatant.hasSoulbind(SOULBINDS.FORGELITE_PRIME_MIKANIKOS.id);

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
    const [lastCast, cdr] = this.casts[this.casts.length - 1];
    const baseCd = this.abilities.getExpectedCooldownDuration(lastCast.ability.guid, lastCast);
    if (baseCd == null) {
      debug && this.warn('no cd for', lastCast.ability.name);
      return;
    }

    if (cdr >= baseCd / 3) {
      return;
    }

    const newCdr = cdr + this.spellUsable.reduceCooldown(lastCast.ability.guid, baseCd / 15);
    this.casts[this.casts.length - 1][1] = newCdr;
  }
}

export default EffusiveAnimaAccelerator;
