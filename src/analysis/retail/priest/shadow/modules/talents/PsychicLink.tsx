import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { DamageEvent } from 'parser/core/Events';
import Events from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';

class PsychicLink extends Analyzer {
  recentSpell = '';

  damageTotal = 0; //damage from Psychic Link

  //damage of Psychic Link by the spell that caused it
  damageMB = 0;
  damageSWD = 0;
  damageDP = 0;
  damageMF = 0;
  damageMFI = 0;
  damageVT = 0;
  damageVB = 0;
  damageIN = 0;
  damageVV = 0;

  //Total hits of Psychic Link
  totalHits = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PSYCHIC_LINK_TALENT);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_BLAST), this.onSpell);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_WORD_DEATH_TALENT),
      this.onSpell,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_WORD_MADNESS_TALENT),
      this.onSpell,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY), this.onSpell);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE),
      this.onSpell,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.VOID_TORRENT_TALENT),
      this.onSpell,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.VOID_BOLT), this.onSpell);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.VOID_VOLLEY_DAMAGE),
      this.onSpell,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.IDOL_OF_NZOTH_DAMAGE_HORRIFIC_VISION),
      this.onSpell,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.IDOL_OF_NZOTH_DAMAGE_VISION_OF_NZOTH),
      this.onSpell,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PSYCHIC_LINK_TALENT_DAMAGE),
      this.onLink,
    );
  }

  onSpell(event: DamageEvent) {
    this.recentSpell = event.ability.name;
  }

  onLink(event: DamageEvent) {
    this.damageTotal += event.amount + (event.absorbed || 0);
    this.totalHits += 1;

    switch (this.recentSpell) {
      case SPELLS.MIND_BLAST.name:
        this.damageMB += event.amount + (event.absorbed || 0);
        break;
      case TALENTS.SHADOW_WORD_DEATH_TALENT.name:
        this.damageSWD += event.amount + (event.absorbed || 0);
        break;
      case TALENTS.SHADOW_WORD_MADNESS_TALENT.name:
        this.damageDP += event.amount + (event.absorbed || 0);
        break;
      case SPELLS.MIND_FLAY.name:
        this.damageMF += event.amount + (event.absorbed || 0);
        break;
      case SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE.name:
        this.damageMFI += event.amount + (event.absorbed || 0);
        break;
      case TALENTS.VOID_TORRENT_TALENT.name:
        this.damageVT += event.amount + (event.absorbed || 0);
        break;
      case SPELLS.VOID_BOLT.name:
        this.damageVB += event.amount + (event.absorbed || 0);
        break;
      case SPELLS.VOID_VOLLEY_DAMAGE.name:
        this.damageVV += event.amount + (event.absorbed || 0);
        break;
      case SPELLS.IDOL_OF_NZOTH_DAMAGE_VISION_OF_NZOTH.name:
        this.damageIN += event.amount + (event.absorbed || 0);
        break;
      case SPELLS.IDOL_OF_NZOTH_DAMAGE_HORRIFIC_VISION.name:
        this.damageIN += event.amount + (event.absorbed || 0);
        break;
      default:
        break;
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip="Contribution by each spell"
      >
        <BoringSpellValueText spell={TALENTS.PSYCHIC_LINK_TALENT}>
          <ItemDamageDone amount={this.damageTotal} />
          <small>
            <div>
              <SpellLink spell={SPELLS.MIND_BLAST} />:{' '}
              {formatPercentage(this.damageMB / this.damageTotal, 1)}%
            </div>

            <div>
              <SpellLink spell={TALENTS.SHADOW_WORD_DEATH_TALENT} />:{' '}
              {formatPercentage(this.damageSWD / this.damageTotal, 1)}%
            </div>

            <div>
              <SpellLink spell={TALENTS.SHADOW_WORD_MADNESS_TALENT} />:{' '}
              {formatPercentage(this.damageDP / this.damageTotal, 1)}%
            </div>

            {this.selectedCombatant.hasTalent(TALENTS.VOIDFORM_TALENT) ? (
              <div>
                <SpellLink spell={SPELLS.VOID_BOLT} />:{' '}
                {formatPercentage(this.damageVB / this.damageTotal, 1)}%
              </div>
            ) : null}

            <div>
              <SpellLink spell={SPELLS.MIND_FLAY} />:{' '}
              {formatPercentage(this.damageMF / this.damageTotal, 1)}%
            </div>
            {this.selectedCombatant.hasTalent(TALENTS.SURGE_OF_INSANITY_TALENT) ? (
              <div>
                <SpellLink spell={SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE} />:{' '}
                {formatPercentage(this.damageMFI / this.damageTotal, 1)}%
              </div>
            ) : null}
            {this.selectedCombatant.hasTalent(TALENTS.VOID_TORRENT_TALENT) ? (
              <div>
                <SpellLink spell={TALENTS.VOID_TORRENT_TALENT} />:{' '}
                {formatPercentage(this.damageVT / this.damageTotal, 1)}%
              </div>
            ) : null}
            {this.selectedCombatant.hasTalent(TALENTS.VOIDFORM_TALENT) ? ( //TODO: VOID VOLLEY
              <div>
                <SpellLink spell={TALENTS.VOIDFORM_TALENT} />:{' '}
                {formatPercentage(this.damageVV / this.damageTotal, 1)}%
              </div>
            ) : null}
            {this.selectedCombatant.hasTalent(TALENTS.IDOL_OF_NZOTH_TALENT) ? (
              <div>
                <SpellLink spell={TALENTS.IDOL_OF_NZOTH_TALENT} />:{' '}
                {formatPercentage(this.damageIN / this.damageTotal, 1)}%
              </div>
            ) : null}
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PsychicLink;
