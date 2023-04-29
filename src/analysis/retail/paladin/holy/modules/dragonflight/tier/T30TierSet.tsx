import SPELLS from 'common/SPELLS';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent, ResourceChangeEvent } from 'parser/core/Events';
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

const CRIT_HEAL_AMOUNT = 1.65;
const TWO_PIECE_HEAL_INC = CRIT_HEAL_AMOUNT / 1.5; // 210% heal instead of 150% on crit
const HOLY_PRISM_INC = 0.8;

class T30HpalTierSet extends Analyzer {
  has4Piece: boolean = false;
  hsHealing: number = 0;
  hsOverhealing: number = 0;
  hpGained: number = 0;
  hpWasted: number = 0;
  lhTiktok: boolean = false; // if true, count set of lh heals
  fourPcHealing: number = 0;
  fourPcOverhealing: number = 0;
  countedHeals: Set<HealEvent> = new Set();
  extraLhHits: number = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.T30);
    if (!this.active) {
      return;
    }
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.T30);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HOLY_SHOCK_HEAL),
      this.onHolyShockHeal,
    );
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
    this.addEventListener(Events.resourcechange.by(SELECTED_PLAYER), this.onHpGain);
  }

  onHolyShockHeal(event: HealEvent) {
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    this.hsHealing += calculateEffectiveHealing(event, TWO_PIECE_HEAL_INC);
    this.hsOverhealing += calculateOverhealing(event, TWO_PIECE_HEAL_INC);
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

  onLHHeal(event: HealEvent) {
    if (this.countedHeals.has(event)) {
      return;
    }
    const healEvents = getLightsHammerHeals(event);
    if (this.lhTiktok) {
      healEvents.forEach((ev) => {
        this.fourPcHealing += ev.amount;
        this.fourPcOverhealing += ev.overheal || 0;
        this.countedHeals.add(ev);
        this.extraLhHits += 1;
      });
    }
    // mark events as counted
    healEvents.forEach((ev) => {
      this.countedHeals.add(ev);
    });
    this.lhTiktok = !this.lhTiktok;
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
          <h4>4 Piece</h4>
          <ItemHealingDone amount={this.fourPcHealing} /> <br />
          {this.hpGained} <small> extra Holy Power</small>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default T30HpalTierSet;
