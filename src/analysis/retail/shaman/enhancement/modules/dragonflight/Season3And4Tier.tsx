import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import Abilities from 'parser/core/modules/Abilities';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import ItemSetLink from 'interface/ItemSetLink';
import { SHAMAN_DF3_ID, SHAMAN_DF4_ID } from 'common/ITEMS/dragonflight';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { UptimeIcon } from 'interface/icons';
import { formatNumber, formatPercentage } from 'common/format';

const PRIMORDIAL_WAVE_COOLDOWN_PER_SUMMON = 7000;

class Season3And4Tier extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
  };
  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;
  protected primordialWaveTotalCooldownReduction: number = 0;
  protected primordialWaveCooldownEffectiveReduction: number = 0;
  protected primordialWaveCasts: number = 0;
  protected twoSetDamageBonus: number = 0;

  constructor(options: Options) {
    super(options);

    this.active =
      (this.selectedCombatant.has4PieceByTier(TIERS.DF3) ||
        this.selectedCombatant.has4PieceByTier(TIERS.DF4)) &&
      this.selectedCombatant.hasTalent(TALENTS_SHAMAN.PRIMORDIAL_WAVE_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_SHAMAN.FERAL_SPIRIT_TALENT),
      (e) => this.onFeralSpiritSummoned(e.timestamp, 2),
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_SHAMAN.PRIMORDIAL_WAVE_TALENT),
      this.onPrimordialWaveCast,
    );
  }

  onPrimordialWaveCast(event: CastEvent) {
    this.primordialWaveCasts += 1;
    this.onFeralSpiritSummoned(event.timestamp + 1, 1);
  }

  onFeralSpiritSummoned(timestamp: number, count: number) {
    this.primordialWaveTotalCooldownReduction += PRIMORDIAL_WAVE_COOLDOWN_PER_SUMMON * count;
    this.primordialWaveCooldownEffectiveReduction += this.spellUsable.reduceCooldown(
      TALENTS_SHAMAN.PRIMORDIAL_WAVE_TALENT.id,
      PRIMORDIAL_WAVE_COOLDOWN_PER_SUMMON * count,
      timestamp,
    );
  }

  get wasted() {
    return (
      this.primordialWaveTotalCooldownReduction - this.primordialWaveCooldownEffectiveReduction
    );
  }

  get averageReduction() {
    return this.primordialWaveCasts
      ? this.primordialWaveCooldownEffectiveReduction / 1000 / this.primordialWaveCasts
      : 0;
  }

  get wastedPercent() {
    return this.wasted / (this.wasted + this.primordialWaveTotalCooldownReduction);
  }

  statistic() {
    const tierSetId = this.selectedCombatant.has4PieceByTier(TIERS.DF4)
      ? SHAMAN_DF4_ID
      : SHAMAN_DF3_ID;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(0)}
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={
          <>
            {formatNumber(this.primordialWaveCooldownEffectiveReduction / 1000)} sec total effective
            reduction
            <br />
            {formatNumber(this.wasted / 1000)} sec ({formatPercentage(this.wastedPercent)}%) wasted
            reduction.
          </>
        }
      >
        <div className="pad boring-text">
          <label>
            <ItemSetLink id={tierSetId}>
              <>
                Vision of the Greatwolf Outcast
                <br />
                (Tier-31 Set)
              </>
            </ItemSetLink>
          </label>
        </div>
        <div className="value">
          <TalentSpellText talent={TALENTS_SHAMAN.PRIMORDIAL_WAVE_TALENT}>
            <>
              <UptimeIcon /> {formatNumber(this.averageReduction)} sec{' '}
              <small>average reduction</small>
            </>
          </TalentSpellText>
        </div>
      </Statistic>
    );
  }
}

export default Season3And4Tier;
