import type { JSX } from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellLink from 'interface/SpellLink';
import Events, {
  CastEvent,
  DamageEvent,
  DeathEvent,
  FightEndEvent,
  Item,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS/classic/warlock';
import { PerformanceMark } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import GEAR_SLOTS from 'game/GEAR_SLOTS';
import TRINKETS from 'common/ITEMS/classic/trinkets';
import ItemLink from 'interface/ItemLink';
import enchanting from 'common/SPELLS/classic/enchanting';
import { SpellInfo } from 'parser/core/EventFilter';
import engineering from 'common/SPELLS/classic/engineering';
import tailoring from 'common/SPELLS/classic/tailoring';
import potions from 'common/SPELLS/classic/potions';
import { formatDuration, formatNumber } from 'common/format';
import Icon from 'interface/Icon';

export interface DoomguardData {
  inferno: {
    summonEvent?: CastEvent;
  };
  doomguard: {
    summonTimestamp: number;
    deathTimestamp: number;
    summonEvent?: CastEvent;
    castEvents: CastEvent[];
    totalDamage: number;
  };
  summonedDemonSummary: JSX.Element;
}

export interface SnapshotQualityEntry {
  item?: Item;
  relatedBuffs: SpellInfo[];
  issueWithItemOrEnchant: boolean;
  snapshotQuality: QualitativePerformance;
  snapshotSummary: JSX.Element;
}

const doomguardGameId = 11859;
export default class Doomguard extends Analyzer {
  doomguardSummonData: DoomguardData = {
    doomguard: {
      summonTimestamp: 0,
      deathTimestamp: 0,
      castEvents: [],
      totalDamage: 0,
    },
    inferno: {},
    summonedDemonSummary: <></>,
  };
  snapshotQualityEntries: SnapshotQualityEntry[] = [];
  snapshotAdvice: JSX.Element = (<></>);
  private doomguardId = 0;

  constructor(options: Options) {
    super(options);
    this.buildSnapshotEntries();
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SUMMON_DOOMGUARD),
      this.onDoomguardSummonEvent,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.SUMMON_INFERNAL]),
      this.onInfernoCast,
    );
    this.addEventListener(
      Events.cast.by(this.doomguardId).spell([SPELLS.DOOM_BOLT]),
      this.onDoomguardCast,
    );
    this.addEventListener(
      Events.damage.by(this.doomguardId).spell([SPELLS.DOOM_BOLT]),
      this.onDoomguardDamage,
    );
    this.addEventListener(Events.death, this.onDoomguardDeath);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private buildSnapshotEntries() {
    this.snapshotQualityEntries = [
      // Equipped gear related
      this.synapseSpringsSnapshotEntry(),
      this.lightweaveSnapshotEntry(),
      this.powerTorrentSnapshotEntry(),
      this.trinketSnapshotEntry(GEAR_SLOTS.TRINKET1),
      this.trinketSnapshotEntry(GEAR_SLOTS.TRINKET2),
      // Not gear related
      this.spellSnapshotEntry(potions.POTION_OF_THE_JADE_SERPENT),
      this.spellSnapshotEntry(enchanting.HURRICANE_BUFF), // This is expected on prepull gear, so only buff is trackable
    ];
  }

  private synapseSpringsSnapshotEntry(): SnapshotQualityEntry {
    const equippedItem = this.selectedCombatant.hands;

    const synapseSpringsAvailable =
      equippedItem.onUseEnchant === engineering.SYNAPSE_SPRINGS_INTEL_BUFF.enchantId;

    return {
      item: equippedItem,
      snapshotQuality: QualitativePerformance.Fail,
      relatedBuffs: [engineering.SYNAPSE_SPRINGS_INTEL_BUFF],
      issueWithItemOrEnchant: !synapseSpringsAvailable,
      snapshotSummary: synapseSpringsAvailable ? (
        <></>
      ) : (
        <li>
          <ItemLink id={equippedItem.id} details={equippedItem} icon={false}>
            <Icon icon={equippedItem.icon} />
          </ItemLink>{' '}
          is not enchanted with <SpellLink spell={engineering.SYNAPSE_SPRINGS} />. If you are not
          engineer, consider changing professions. Engineering the best profession for warlocks due
          to snapshotting.
        </li>
      ),
    };
  }
  private lightweaveSnapshotEntry(): SnapshotQualityEntry {
    const equippedItem = this.selectedCombatant.back;

    const lighweaveAvailable =
      equippedItem.permanentEnchant === tailoring.LIGHTWEAVE_BUFF_RANK_2.enchantId;
    return {
      item: equippedItem,
      snapshotQuality: QualitativePerformance.Fail,
      relatedBuffs: [tailoring.LIGHTWEAVE_BUFF_RANK_2],
      issueWithItemOrEnchant: !lighweaveAvailable,
      snapshotSummary: lighweaveAvailable ? (
        <></>
      ) : (
        <li>
          <ItemLink id={equippedItem.id} details={equippedItem} icon={false}>
            <Icon icon={equippedItem.icon} />
          </ItemLink>{' '}
          is not enchanted with <SpellLink spell={tailoring.LIGHTWEAVE_BUFF_RANK_2} />. If you are
          not a tailor, consider changing professions. Tailoring is the 2nd best profession for
          warlocks due to snapshotting.
        </li>
      ),
    };
  }
  private powerTorrentSnapshotEntry(): SnapshotQualityEntry {
    const equippedItem = this.selectedCombatant.mainHand;

    const powerTorrentAvailable =
      equippedItem.permanentEnchant === enchanting.POWER_TORRENT_BUFF.effectId;
    return {
      item: equippedItem,
      snapshotQuality: QualitativePerformance.Fail,
      relatedBuffs: [enchanting.POWER_TORRENT_BUFF],
      issueWithItemOrEnchant: !powerTorrentAvailable,
      snapshotSummary: powerTorrentAvailable ? (
        <></>
      ) : (
        <li>
          <ItemLink id={equippedItem.id} details={equippedItem} icon={false}>
            <Icon icon={equippedItem.icon} />
          </ItemLink>{' '}
          is not enchanted with <SpellLink spell={enchanting.POWER_TORRENT_BUFF} />.
        </li>
      ),
    };
  }
  private trinketSnapshotEntry(gearSlot: number): SnapshotQualityEntry {
    const equippedItem = this.selectedCombatant._getGearItemBySlotId(gearSlot);

    const itemRelatedBuffs: SpellInfo[] = [];
    const trinket = Object.entries(TRINKETS).find(([_, val]) => val.id === equippedItem.id)?.[1];

    if (!trinket) {
      return {
        item: trinket,
        relatedBuffs: [],
        snapshotQuality: QualitativePerformance.Ok,
        issueWithItemOrEnchant: true,
        snapshotSummary: (
          <li>
            <ItemLink id={equippedItem.id} details={equippedItem} icon={false}>
              <Icon icon={equippedItem.icon} />
            </ItemLink>{' '}
            is not in the WowAnalyzer database. Reach out on discord to have it added.
          </li>
        ),
      };
    } else {
      trinket.buffs.forEach((buff) => {
        itemRelatedBuffs.push(buff);
      });
      return {
        item: equippedItem,
        issueWithItemOrEnchant: false,
        snapshotQuality: QualitativePerformance.Fail,
        relatedBuffs: itemRelatedBuffs,
        snapshotSummary: <></>,
      };
    }
  }
  private spellSnapshotEntry(spellInfo: SpellInfo): SnapshotQualityEntry {
    return {
      snapshotQuality: QualitativePerformance.Fail,
      issueWithItemOrEnchant: false,
      relatedBuffs: [spellInfo],
      snapshotSummary: <></>,
    };
  }
  private onDoomguardSummonEvent(event: CastEvent) {
    this.doomguardSummonData.doomguard.summonEvent = event;
    this.doomguardSummonData.doomguard.summonTimestamp = event.timestamp;

    const doomguardId = this.owner.playerPets.find(
      (pet) => pet.guid === doomguardGameId && pet.petOwner === this.selectedCombatant.player.id,
    )?.id;
    if (doomguardId) {
      this.doomguardId = doomguardId;
    }

    this.snapshotQualityEntries.forEach((entry) => {
      if (!entry.issueWithItemOrEnchant) {
        entry.relatedBuffs?.forEach((relatedBuff) => {
          if (this.selectedCombatant.hasBuff(relatedBuff.id, event.timestamp)) {
            entry.snapshotQuality = QualitativePerformance.Good;
            entry.snapshotSummary = (
              <li>
                <PerformanceMark perf={entry.snapshotQuality} />{' '}
                <SpellLink spell={relatedBuff.id} />{' '}
                {entry.item ? (
                  <>
                    {' '}
                    from{' '}
                    <ItemLink id={entry.item.id} details={entry.item} icon={false}>
                      <Icon icon={entry.item.icon} />
                    </ItemLink>
                  </>
                ) : (
                  <></>
                )}
              </li>
            );
          }
          if (entry.snapshotQuality === QualitativePerformance.Fail) {
            entry.snapshotSummary = (
              <li>
                <PerformanceMark perf={entry.snapshotQuality} />{' '}
                <SpellLink spell={entry.relatedBuffs[0].id} />{' '}
                {entry.item ? (
                  <>
                    {' '}
                    from{' '}
                    <ItemLink id={entry.item.id} details={entry.item} icon={false}>
                      <Icon icon={entry.item.icon} />
                    </ItemLink>
                  </>
                ) : (
                  <></>
                )}
              </li>
            );
          }
        });
      }
    });

    const failedEntries = this.snapshotQualityEntries.filter(
      (entry) => entry.snapshotQuality === QualitativePerformance.Fail,
    );

    switch (failedEntries.length) {
      case 0:
        this.snapshotAdvice = <>You snapshotted every possible buff! Perfect!</>;
        break;
      case 1:
        if (failedEntries[0].relatedBuffs[0] === enchanting.HURRICANE_BUFF) {
          this.snapshotAdvice = (
            <>
              <p>
                You snapshotted every possible buff except{' '}
                <SpellLink spell={enchanting.HURRICANE_BUFF} />.
              </p>
              <p>
                You can proc both <SpellLink spell={enchanting.POWER_TORRENT_BUFF} /> and{' '}
                <SpellLink spell={enchanting.HURRICANE_BUFF} /> by:
              </p>
              <ol>
                <li>Swapping to your normal weapon before entering combat.</li>
              </ol>
              <p>This has a ~15% chance to give your Doomguard an additional ~3.5% haste.</p>
            </>
          );
        } else {
          this.snapshotAdvice = (
            <>
              You failed to snapshot a buff. Try to summon your doomguard when all buffs are active.
            </>
          );
        }
        break;
      default:
        this.snapshotAdvice = (
          <>
            You failed to snapshot several buffs. Try to summon your doomguard when all buffs are
            active.
          </>
        );
        break;
    }
  }
  private onDoomguardDamage(event: DamageEvent) {
    if (this.doomguardSummonData.doomguard.totalDamage === undefined) {
      this.doomguardSummonData.doomguard.totalDamage = 0;
    }
    this.doomguardSummonData.doomguard.totalDamage += event.amount;
  }
  private onFightEnd(event: FightEndEvent) {
    if (
      this.doomguardSummonData.doomguard.summonTimestamp !== 0 &&
      this.doomguardSummonData.doomguard.deathTimestamp === 0
    ) {
      this.doomguardSummonData.doomguard.deathTimestamp = event.timestamp;
    }
  }
  private onDoomguardDeath(event: DeathEvent) {
    if (event.targetID === this.doomguardId) {
      this.doomguardSummonData.doomguard.deathTimestamp = event.timestamp;
      const doomguardDuration =
        event.timestamp - this.doomguardSummonData.doomguard.summonTimestamp;
      if (doomguardDuration >= 64000) {
        this.doomguardSummonData.summonedDemonSummary = (
          <li>
            <PerformanceMark perf={QualitativePerformance.Perfect} /> You cast{' '}
            <SpellLink spell={SPELLS.SUMMON_DOOMGUARD} /> at{' '}
            {formatDuration(
              this.doomguardSummonData.doomguard.summonTimestamp - this.owner.fight.start_time,
            )}
            , for a full <strong>{formatDuration(doomguardDuration)}</strong> duration and{' '}
            <strong>{formatNumber(this.doomguardSummonData.doomguard.totalDamage)}</strong>{' '}
            damage{' '}
          </li>
        );
      } else {
        this.doomguardSummonData.summonedDemonSummary = (
          <li>
            <PerformanceMark perf={QualitativePerformance.Good} /> You cast{' '}
            <SpellLink spell={SPELLS.SUMMON_DOOMGUARD} /> at{' '}
            {formatDuration(
              this.doomguardSummonData.doomguard.summonTimestamp - this.owner.fight.start_time,
            )}
            , for a <strong>{formatDuration(doomguardDuration)}</strong> duration. It did a total of{' '}
            {formatNumber(this.doomguardSummonData.doomguard.totalDamage)} damage, but your
            doomguard did not live for its entire duration. Make sure that cast it soon enough so
            fight does not end before your doomguard expires.
          </li>
        );
      }
    }
  }
  private onDoomguardCast(event: CastEvent) {
    this.doomguardSummonData.doomguard.castEvents.push(event);
    //TODO Check if there's a reliable way to track doomguard not casting for some reasons (being silenced/interrupted/moving/etc.)
  }
  private onInfernoCast(event: CastEvent) {
    this.doomguardSummonData.inferno.summonEvent = event;
    this.doomguardSummonData.summonedDemonSummary = (
      <li>
        <PerformanceMark perf={QualitativePerformance.Fail} /> You used{' '}
        <SpellLink spell={SPELLS.SUMMON_INFERNAL} /> at{' '}
        {formatDuration(event.timestamp - this.owner.fight.start_time)} which shares its cooldown
        with <SpellLink spell={SPELLS.SUMMON_DOOMGUARD} />. Unless you face a heavy sustained AoE
        damage situation, where Inferno can cleave for a major part of its duration, or if it is
        absolutely required by your raid, a <strong>doomguard will do more damage</strong>.
      </li>
    );
  }
}
