import SPELLS from 'common/SPELLS';
import { formatPercentage, formatNumber } from 'common/format';
import { TIERS } from 'game/TIERS';
import SpellIcon from 'interface/SpellIcon';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  ApplyDebuffEvent,
  CastEvent,
  DamageEvent,
  RemoveDebuffEvent,
  SummonEvent,
} from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import StatisticBar from 'parser/ui/StatisticBar';
import UptimeBar from 'parser/ui/UptimeBar';

class T31AmirdrassilDemonology extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;
  has2Piece: boolean;
  has4Piece: boolean;

  doomBrand = {
    applyBuffCount: 0,
    removeBuffCount: 0,
    damage: 0,
    hits: 0,
  };
  doomfiend = {
    summons: 0,
    casts: 0,
    hits: 0,
    damage: 0,
  };
  demonboltCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.DF3);
    this.has2Piece = this.active;
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.DF3);

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.DOOM_BRAND_DEBUFF),
      this.onDoomBrandApply,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.DOOM_BRAND_DEBUFF),
      this.onDoomBrandRemove,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DOOM_BRAND_DAMAGE),
      this.onDoomBrandDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DEMONBOLT),
      this.onDemonboltDamage,
    );
    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(SPELLS.DOOMFIEND_SUMMON),
      this.onDoomfiendSummon,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER_PET).spell(SPELLS.DOOMFIEND_DOOM_BOLT_VOLLEY),
      this.onDoomfiendCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.DOOMFIEND_DOOM_BOLT_VOLLEY),
      this.onDoomfiendVolleyDamage,
    );
  }

  // 2pc doombrand -------------------------------------------------------------

  onDoomBrandApply(event: ApplyDebuffEvent) {
    this.doomBrand.applyBuffCount += 1;
  }

  onDoomBrandRemove(event: RemoveDebuffEvent) {
    this.doomBrand.removeBuffCount += 1;
  }

  onDoomBrandDamage(event: DamageEvent) {
    this.doomBrand.hits += 1;
    this.doomBrand.damage += event.amount + (event.absorbed || 0);
  }

  onDemonboltDamage(event: DamageEvent) {
    // TODO low prio
    // check if db was cast into a target with doombrand when a target without it is available
    this.demonboltCasts += 1;
  }

  get doomBrandUptime() {
    return this.enemies.getBuffUptime(SPELLS.DOOM_BRAND_DEBUFF.id) / this.owner.fightDuration;
  }

  get doomBrandHitsPerExpire() {
    return this.doomBrand.hits / this.doomBrand.removeBuffCount;
  }

  get doomBrandDamagePerExpire() {
    return this.doomBrand.damage / this.doomBrand.removeBuffCount;
  }

  // 4pc doomfiend -------------------------------------------------------------

  onDoomfiendSummon(event: SummonEvent) {
    this.doomfiend.summons += 1;
  }

  onDoomfiendCast(event: CastEvent) {
    this.doomfiend.casts += 1;
  }

  onDoomfiendVolleyDamage(event: DamageEvent) {
    this.doomfiend.hits += 1;
    this.doomfiend.damage += event.amount + (event.absorbed || 0);
  }

  get doomfiendCastsPerSummon() {
    return this.doomfiend.casts / this.doomfiend.summons;
  }

  get doomfiendHitsPerVolley() {
    return this.doomfiend.hits / this.doomfiend.casts;
  }

  get doomfiendDamagePerSummon() {
    return this.doomfiend.damage / this.doomfiend.summons;
  }

  statistic() {
    return (
      <>
        <StatisticBar wide position={STATISTIC_ORDER.CORE(1)}>
          <div className="flex">
            <div className="flex-sub icon">
              <SpellIcon spell={SPELLS.DOOM_BRAND_DEBUFF} />
            </div>
            <div className="flex-sub value" style={{ width: 140 }}>
              {formatPercentage(this.doomBrandUptime, 0)}% <small>uptime</small>
            </div>
            <div className="flex-main chart" style={{ padding: 10 }}>
              <UptimeBar
                uptimeHistory={this.enemies.getDebuffHistory(SPELLS.DOOM_BRAND_DEBUFF.id)}
                start={this.owner.fight.start_time}
                end={this.owner.fight.end_time}
              />
            </div>
          </div>
        </StatisticBar>
        <Statistic
          size="flexible"
          position={STATISTIC_ORDER.CORE(7)}
          tooltip={
            <>
              <p>
                Uptime should be as high as possible {'>'}85%. If the target dies with the debuff it
                still explodes for damage on other targets and can proc a Doomfiend
              </p>
              <p>Doom Brand hits: {this.doomBrand.hits}</p>
              <p>Avg. damage per Brand: {formatNumber(this.doomBrandDamagePerExpire)}</p>
              <p>Volleys per summon: {this.doomfiendCastsPerSummon.toFixed(1)}</p>
              <p>Avg. damage per Doomfiend: {formatNumber(this.doomfiendDamagePerSummon)} </p>
            </>
          }
        >
          <BoringSpellValueText spell={SPELLS.DOOM_BRAND_DEBUFF}>
            <p>
              {this.doomBrand.removeBuffCount} <small>brands exploded</small>{' '}
            </p>
            {this.doomBrandHitsPerExpire > 1 && (
              <p>
                {this.doomBrandHitsPerExpire.toFixed(1)} <small>targets hit per brand</small>
              </p>
            )}
          </BoringSpellValueText>
          <BoringSpellValueText spell={SPELLS.DOOMFIEND_SUMMON}>
            <div>
              <p>
                {this.doomfiend.summons} <small>doomfiends summoned </small>{' '}
              </p>
              {this.doomfiendHitsPerVolley > 1 && (
                <p>
                  {this.doomfiendHitsPerVolley.toFixed(1)}{' '}
                  <small>
                    {' '}
                    target{this.doomfiendHitsPerVolley !== 1 ? 's' : ''} hit per volley
                  </small>{' '}
                </p>
              )}
            </div>
          </BoringSpellValueText>
        </Statistic>
      </>
    );
  }
}

export default T31AmirdrassilDemonology;
