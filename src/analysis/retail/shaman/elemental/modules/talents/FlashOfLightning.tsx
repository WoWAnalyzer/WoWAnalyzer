import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SpellLink from 'interface/SpellLink';
import { formatNumber } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { UptimeIcon } from 'interface/icons';

const FLASH_OF_LIGHTING_AFFECTED_SPELL_IDS: number[] = [
  TALENTS.ANCESTRAL_GUIDANCE_TALENT.id,
  TALENTS.ASTRAL_SHIFT_TALENT.id,
  SPELLS.ANCESTRAL_SWIFTNESS_CAST.id,
  SPELLS.BLOODLUST.id,
  SPELLS.HEROISM.id,
  TALENTS.CAPACITOR_TOTEM_TALENT.id,
  TALENTS.CLEANSE_SPIRIT_TALENT.id,
  SPELLS.EARTHBIND_TOTEM.id,
  TALENTS.EARTHGRAB_TOTEM_TALENT.id,
  TALENTS.EARTH_ELEMENTAL_TALENT.id,
  SPELLS.FLAME_SHOCK.id,
  TALENTS.GREATER_PURGE_TALENT.id,
  TALENTS.GUST_OF_WIND_TALENT.id,
  TALENTS.HEALING_STREAM_TOTEM_SHARED_TALENT.id,
  TALENTS.HEX_TALENT.id,
  TALENTS.LIGHTNING_LASSO_TALENT.id,
  TALENTS.NATURES_SWIFTNESS_TALENT.id,
  TALENTS.POISON_CLEANSING_TOTEM_TALENT.id,
  TALENTS.PRIMORDIAL_WAVE_SPEC_TALENT.id,
  SPELLS.REINCARNATION.id,
  TALENTS.SPIRITWALKERS_GRACE_TALENT.id,
  TALENTS.STONE_BULWARK_TOTEM_TALENT.id,
  TALENTS.STORM_ELEMENTAL_TALENT.id,
  SPELLS.STORMKEEPER_BUFF_AND_CAST.id,
  TALENTS.THUNDERSTORM_TALENT.id,
  TALENTS.TOTEMIC_PROJECTION_TALENT.id,
  TALENTS.TOTEMIC_RECALL_TALENT.id,
  TALENTS.TREMOR_TOTEM_TALENT.id,
  TALENTS.WIND_RUSH_TOTEM_TALENT.id,
  TALENTS.WIND_SHEAR_TALENT.id,
];

class FlashOfLightning extends Analyzer.withDependencies({ spellUsable: SpellUsable }) {
  private readonly reducedCooldowns = new Map<number, number>();

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.FLASH_OF_LIGHTNING_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([SPELLS.LIGHTNING_BOLT, TALENTS.CHAIN_LIGHTNING_TALENT]),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    FLASH_OF_LIGHTING_AFFECTED_SPELL_IDS.forEach((spellId) => {
      if (this.deps.spellUsable.isOnCooldown(spellId)) {
        const cdr = this.deps.spellUsable.reduceCooldown(spellId, 1000, event.timestamp);
        this.reducedCooldowns.set(spellId, (this.reducedCooldowns.get(spellId) ?? 0) + cdr);
      }
    });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Ability</th>
                  <th>Cooldown Reduction (sec)</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(this.reducedCooldowns.entries()).map(([spellId, cdr]) => {
                  return (
                    <tr key={spellId}>
                      <td>
                        <strong>
                          <SpellLink spell={spellId} />
                        </strong>
                      </td>
                      <td>{formatNumber(cdr / 1000)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.FLASH_OF_LIGHTNING_TALENT}>
          <>
            <p>
              <UptimeIcon />{' '}
              {formatNumber(
                Array.from(this.reducedCooldowns.values()).reduce(
                  (total, value) => (total += value),
                  0,
                ) / 1000,
              )}{' '}
              sec <br />
              <small> total effective reduction</small>
            </p>
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default FlashOfLightning;
