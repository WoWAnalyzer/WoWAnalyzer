import SPELLS from 'common/SPELLS';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, HealEvent, ResourceChangeEvent } from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_PALADIN } from 'common/TALENTS';
import { formatNumber } from 'common/format';
import HIT_TYPES from 'game/HIT_TYPES';
import { getLightsHammerHeals } from '../../../normalizers/CastLinkNormalizer';
import { SpellLink } from 'interface';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const CRIT_HEAL_INC = 0.6;
const TWO_PIECE_HEAL_INC = CRIT_HEAL_INC / 2; // 260% heal instead of 200% on crit
const HOLY_PRISM_INC = 0.8;

class T30HpalTierSet extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;
  has4Piece: boolean = false;
  // 2 piece variables
  hsHealing: number = 0;
  hsOverhealing: number = 0;
  hpGained: number = 0;
  hpWasted: number = 0;
  totalCdr: number = 0;
  fourPcSpellId: number = 0;
  cdrPerCast: number = 0;
  wastedCdr: number = 0;
  // 4 piece variables
  fourPcHealing: number = 0;
  fourPcOverhealing: number = 0;
  countedHeals: Set<HealEvent> = new Set();
  extraLhHits: number = 0;
  castTime: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.T30);
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.T30);
    if (this.selectedCombatant.hasTalent(TALENTS_PALADIN.HOLY_PRISM_TALENT)) {
      this.fourPcSpellId = TALENTS_PALADIN.HOLY_PRISM_TALENT.id;
      this.cdrPerCast = 1;
    } else {
      this.fourPcSpellId = TALENTS_PALADIN.LIGHTS_HAMMER_TALENT.id;
      this.cdrPerCast = 2;
    }
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HOLY_SHOCK_HEAL),
      this.onHolyShockHeal,
    );
    if (!this.has4Piece) {
      return;
    }
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.HOLY_PRISM_HEAL, SPELLS.HOLY_PRISM_HEAL_DIRECT]),
      this.onHolyPrismHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIGHTS_HAMMER_HEAL),
      this.onLHHeal,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_PALADIN.LIGHTS_HAMMER_TALENT),
      this.onLhCast,
    );
    this.addEventListener(Events.resourcechange.by(SELECTED_PLAYER), this.onHpGain);
  }

  onHolyShockHeal(event: HealEvent) {
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    this.hsHealing += calculateEffectiveHealing(event, TWO_PIECE_HEAL_INC);
    this.hsOverhealing += calculateOverhealing(event, TWO_PIECE_HEAL_INC);
    if (!this.spellUsable.isAvailable(this.fourPcSpellId)) {
      this.totalCdr += this.cdrPerCast;
    } else {
      this.wastedCdr += this.cdrPerCast;
    }
  }

  onHpGain(event: ResourceChangeEvent) {
    if (
      event.ability.guid === TALENTS_PALADIN.LIGHTS_HAMMER_TALENT.id ||
      event.ability.guid === TALENTS_PALADIN.HOLY_PRISM_TALENT.id
    ) {
      this.hpGained += event.resourceChange;
      this.hpWasted += event.waste;
    }
  }

  onHolyPrismHeal(event: HealEvent) {
    this.fourPcHealing + calculateEffectiveHealing(event, HOLY_PRISM_INC);
    this.fourPcOverhealing + calculateOverhealing(event, HOLY_PRISM_INC);
  }

  shouldCountHeal(event: HealEvent) {
    const seconds = (event.timestamp - this.castTime) / 1000;
    // if heal group occurred during an odd second then we should count it
    // e.g. if seconds = 5.5 -> 5 % 2 == 1 so we should count it
    return Math.floor(seconds) % 2 !== 0;
  }

  onLhCast(event: CastEvent) {
    this.castTime = event.timestamp;
  }

  onLHHeal(event: HealEvent) {
    if (this.countedHeals.has(event)) {
      return;
    }
    const healEvents = getLightsHammerHeals(event);
    if (this.shouldCountHeal(event)) {
      healEvents.forEach((ev) => {
        this.fourPcHealing += ev.amount + (ev.absorbed || 0);
        this.fourPcOverhealing += ev.overheal || 0;
        this.extraLhHits += 1;
      });
    }
    // mark events as counted
    healEvents.forEach((ev) => {
      this.countedHeals.add(ev);
    });
  }

  get totalHealing() {
    return this.hsHealing + this.fourPcHealing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <ul>
              <li>2 piece overhealing: {formatNumber(this.hsOverhealing)}</li>
              <li>
                Wasted <SpellLink id={this.fourPcSpellId} /> CDR: {this.wastedCdr} seconds
              </li>
              <li>4 piece overhealing: {formatNumber(this.fourPcOverhealing)}</li>
              <li>{this.hpWasted} Holy Power wasted</li>
              {this.selectedCombatant.hasTalent(TALENTS_PALADIN.LIGHTS_HAMMER_TALENT) && (
                <li>
                  {this.extraLhHits} extra{' '}
                  <SpellLink spell={TALENTS_PALADIN.LIGHTS_HAMMER_TALENT} /> hits
                </li>
              )}
            </ul>
          </>
        }
      >
        <BoringValueText label="Heartfire Sentinel's Authority (T30 Set Bonus)">
          <h4>2 Piece</h4>
          <ItemHealingDone amount={this.hsHealing} /> <br />
          {this.totalCdr}{' '}
          <small>
            seconds of <SpellLink id={this.fourPcSpellId} /> CDR
          </small>
          <h4>4 Piece</h4>
          <ItemHealingDone amount={this.fourPcHealing} /> <br />
          {this.hpGained} <small> extra Holy Power</small>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default T30HpalTierSet;
