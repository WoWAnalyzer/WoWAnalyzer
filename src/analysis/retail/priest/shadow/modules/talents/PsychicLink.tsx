import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { DamageEvent } from 'parser/core/Events';
import Events from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { getDamage } from './PsychicLinkNormalizer';
import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';

class PsychicLink extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  recentSpell: string = '';

  damageTotal = 0;
  damageMB = 0;
  damageSWD = 0;
  damageMG = 0;
  damageDP = 0;
  damageMS = 0;
  damageMSI = 0;
  damageVT = 0;
  damageVB = 0;

  XdamageMB = 0;
  XdamageSWD = 0;
  XdamageMG = 0;
  XdamageDP = 0;
  XdamageMS = 0;
  XdamageMSI = 0;
  XdamageVT = 0;
  XdamageVB = 0;

  timesTotal = 0;
  timesEach = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PSYCHIC_LINK_TALENT);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_BLAST), this.onMB);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_WORD_DEATH_TALENT),
      this.onSWD,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.MINDGAMES_TALENT),
      this.onMG,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.DEVOURING_PLAGUE_TALENT),
      this.onDP,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.MIND_SPIKE_TALENT),
      this.onMS,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_SPIKE_INSANITY_TALENT_DAMAGE),
      this.onMSI,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.VOID_TORRENT_TALENT),
      this.onVT,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.VOID_BOLT), this.onVB);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PSYCHIC_LINK_TALENT_DAMAGE),
      this.onLink,
    );
  }

  onMB(event: DamageEvent) {
    //console.log("CAUSEMB", this.owner.formatTimestamp(event.timestamp,3))
    this.recentSpell = 'MB';
  }

  onSWD(event: DamageEvent) {
    //console.log("CAUSE", this.owner.formatTimestamp(event.timestamp,3))
    this.recentSpell = 'SWD';
  }

  onMG(event: DamageEvent) {
    //console.log("CAUSE", this.owner.formatTimestamp(event.timestamp,3))
    this.recentSpell = 'MG';
  }

  onDP(event: DamageEvent) {
    if (!event.tick) {
      //this should be possible to be done through the normalizer.
      //console.log("CAUSEDP", this.owner.formatTimestamp(event.timestamp,3))
      this.recentSpell = 'DP';
    }
  }

  onMS(event: DamageEvent) {
    //console.log("CAUSE", this.owner.formatTimestamp(event.timestamp,3))
    this.recentSpell = 'MS';
  }

  onMSI(event: DamageEvent) {
    //console.log("CAUSE", this.owner.formatTimestamp(event.timestamp,3))
    this.recentSpell = 'MSI';
  }

  onVT(event: DamageEvent) {
    //console.log("CAUSE", this.owner.formatTimestamp(event.timestamp,3))
    this.recentSpell = 'VT';
  }

  onVB(event: DamageEvent) {
    //console.log("CAUSE", this.owner.formatTimestamp(event.timestamp,3))
    this.recentSpell = 'VB';
  }

  onLink(event: DamageEvent) {
    console.log('Link', this.owner.formatTimestamp(event.timestamp, 3));
    this.damageTotal += event.amount;
    this.timesTotal += 1;

    getDamage(event).forEach((e) => {
      console.log('events, e', e);
      console.log('events, event', event);

      const linkedSpell = e.ability;
      //console.log("LinedSpell", linkedSpell);
      this.timesEach += 1;

      switch (linkedSpell.name) {
        case SPELLS.MIND_BLAST.name:
          this.damageMB += event.amount;
          break;
        case TALENTS.SHADOW_WORD_DEATH_TALENT.name:
          this.damageSWD += event.amount;
          break;
        case TALENTS.MINDGAMES_TALENT.name:
          this.damageMG += event.amount;
          break;
        case TALENTS.MIND_SPIKE_TALENT.name:
          this.damageMS += event.amount;
          break;
        case SPELLS.MIND_SPIKE_INSANITY_TALENT_DAMAGE.name:
          this.damageMSI += event.amount;
          break;
        case TALENTS.VOID_TORRENT_TALENT.name:
          this.damageVT += event.amount;
          break;
        case SPELLS.VOID_BOLT.name:
          this.damageVB += event.amount;
          break;
        case TALENTS.DEVOURING_PLAGUE_TALENT.name:
          this.damageDP += event.amount;
          break;
        default:
          break;
      }
    });

    switch (this.recentSpell) {
      case 'MB':
        this.XdamageMB += event.amount;
        break;
      case 'SWD':
        this.XdamageSWD += event.amount;
        break;
      case 'MG':
        this.XdamageMG += event.amount;
        break;
      case 'DP':
        this.XdamageDP += event.amount;
        break;
      case 'MS':
        this.XdamageMS += event.amount;
        break;
      case 'MSI':
        this.XdamageMSI += event.amount;
        break;
      case 'VT':
        this.XdamageVT += event.amount;
        break;
      case 'VB':
        this.XdamageVB += event.amount;
        break;
      default:
        break;
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip="Contrubution by each spell"
      >
        <BoringSpellValueText spell={TALENTS.PSYCHIC_LINK_TALENT}>
          {this.timesEach}/{this.timesTotal} <br />
          <ItemDamageDone amount={this.damageTotal} />
          <small>
            <br />
            <SpellLink spell={SPELLS.MIND_BLAST} />:{' '}
            {formatPercentage(this.damageMB / this.damageTotal, 1)}%<br />
            <SpellLink spell={TALENTS.SHADOW_WORD_DEATH_TALENT} />:{' '}
            {formatPercentage(this.damageSWD / this.damageTotal, 1)}%<br />
            <SpellLink spell={TALENTS.MINDGAMES_TALENT} />:{' '}
            {formatPercentage(this.damageMG / this.damageTotal, 1)}%<br />
            <SpellLink spell={TALENTS.DEVOURING_PLAGUE_TALENT} />:{' '}
            {formatPercentage(this.damageDP / this.damageTotal, 1)}%<br />
            <SpellLink spell={TALENTS.MIND_SPIKE_TALENT} />:{' '}
            {formatPercentage(this.damageMS / this.damageTotal, 1)}%<br />
            <SpellLink spell={SPELLS.MIND_SPIKE_INSANITY_TALENT_DAMAGE} />:{' '}
            {formatPercentage(this.damageMSI / this.damageTotal, 1)}%<br />
            <SpellLink spell={TALENTS.VOID_TORRENT_TALENT} />:{' '}
            {formatPercentage(this.damageVT / this.damageTotal, 1)}%<br />
            <SpellLink spell={SPELLS.VOID_BOLT} />:{' '}
            {formatPercentage(this.damageVB / this.damageTotal, 1)}%<br />
          </small>
          -----------
          <br />
          <ItemDamageDone amount={this.damageTotal} />
          <small>
            <br />
            <SpellLink spell={SPELLS.MIND_BLAST} />:{' '}
            {formatPercentage(this.XdamageMB / this.damageTotal, 1)}%<br />
            <SpellLink spell={TALENTS.SHADOW_WORD_DEATH_TALENT} />:{' '}
            {formatPercentage(this.XdamageSWD / this.damageTotal, 1)}%<br />
            <SpellLink spell={TALENTS.MINDGAMES_TALENT} />:{' '}
            {formatPercentage(this.XdamageMG / this.damageTotal, 1)}%<br />
            <SpellLink spell={TALENTS.DEVOURING_PLAGUE_TALENT} />:{' '}
            {formatPercentage(this.XdamageDP / this.damageTotal, 1)}%<br />
            <SpellLink spell={TALENTS.MIND_SPIKE_TALENT} />:{' '}
            {formatPercentage(this.XdamageMS / this.damageTotal, 1)}%<br />
            <SpellLink spell={SPELLS.MIND_SPIKE_INSANITY_TALENT_DAMAGE} />:{' '}
            {formatPercentage(this.XdamageMSI / this.damageTotal, 1)}%<br />
            <SpellLink spell={TALENTS.VOID_TORRENT_TALENT} />:{' '}
            {formatPercentage(this.XdamageVT / this.damageTotal, 1)}%<br />
            <SpellLink spell={SPELLS.VOID_BOLT} />:{' '}
            {formatPercentage(this.XdamageVB / this.damageTotal, 1)}%<br />
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PsychicLink;
