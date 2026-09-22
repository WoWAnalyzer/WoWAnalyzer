import type { JSX } from 'react';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import Events, { CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemManaGained from 'parser/ui/ItemManaGained';
import { formatNumber } from 'common/format';
import { SpellLink } from 'interface';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

type SwiftnessKind = 'ns' | 'as';

interface SwiftnessConfig {
  /** Buff that makes the next affected spell instant */
  buff: Spell;
  /** Spells that consume the buff */
  affectedSpells: Spell[];
  /** Spell IDs rated Good when buffed */
  goodSpells: number[];
  /** Spell IDs rated Ok when buffed; everything else is a Fail */
  okSpells: number[];
}

const SWIFTNESS_CONFIG: Record<SwiftnessKind, SwiftnessConfig> = {
  ns: {
    buff: SPELLS.NATURES_SWIFTNESS_BUFF,
    affectedSpells: [
      SPELLS.LIGHTNING_BOLT,
      TALENTS_SHAMAN.CHAIN_HEAL_TALENT,
      SPELLS.HEALING_WAVE,
      TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT,
    ],
    goodSpells: [TALENTS_SHAMAN.CHAIN_HEAL_TALENT.id],
    okSpells: [SPELLS.HEALING_WAVE.id],
  },
  as: {
    buff: SPELLS.ANCESTRAL_SWIFTNESS_CAST,
    affectedSpells: [
      SPELLS.LIGHTNING_BOLT,
      TALENTS_SHAMAN.CHAIN_HEAL_TALENT,
      SPELLS.HEALING_WAVE,
      TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT,
      TALENTS_SHAMAN.LAVA_BURST_TALENT,
    ],
    goodSpells: [TALENTS_SHAMAN.CHAIN_HEAL_TALENT.id],
    okSpells: [SPELLS.HEALING_WAVE.id],
  },
};

class NaturesSwiftness extends Analyzer {
  manaSaved = 0;
  castCount = 0;

  castEntries: Record<SwiftnessKind, BoxRowEntry[]> = { ns: [], as: [] };

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_SHAMAN.NATURES_SWIFTNESS_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_SHAMAN.ANCESTRAL_SWIFTNESS_TALENT);

    const allAffectedSpells = [
      ...new Set([...SWIFTNESS_CONFIG.ns.affectedSpells, ...SWIFTNESS_CONFIG.as.affectedSpells]),
    ];

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(allAffectedSpells),
      this.onRelevantCast,
    );
    this.addEventListener(
      Events.applybuff
        .by(SELECTED_PLAYER)
        .spell([SWIFTNESS_CONFIG.ns.buff, SWIFTNESS_CONFIG.as.buff]),
      this.onApplyBuff,
    );
  }

  getActiveKind(): SwiftnessKind | null {
    if (this.selectedCombatant.hasBuff(SWIFTNESS_CONFIG.as.buff.id)) {
      return 'as';
    }
    if (this.selectedCombatant.hasBuff(SWIFTNESS_CONFIG.ns.buff.id)) {
      return 'ns';
    }
    return null;
  }

  onRelevantCast(event: CastEvent) {
    const kind = this.getActiveKind();
    if (!kind) {
      return;
    }

    const config = SWIFTNESS_CONFIG[kind];
    const spellId = event.ability.guid;

    if (!config.affectedSpells.some((spell) => spell.id === spellId)) {
      return;
    }

    this.rateCast(kind, spellId);

    if (!event.resourceCost) {
      return;
    }

    // SpellManaCost already applies talent reductions (like Current Control)
    this.manaSaved += event.resourceCost[RESOURCE_TYPES.MANA.id] ?? 0;
  }

  onApplyBuff() {
    this.castCount += 1;
  }

  get avgManaSaved() {
    return this.castCount > 0 ? this.manaSaved / this.castCount : 0;
  }

  rateCast(kind: SwiftnessKind, spellId: number) {
    const { goodSpells, okSpells } = SWIFTNESS_CONFIG[kind];
    let value: QualitativePerformance;
    let label: string;

    if (goodSpells.includes(spellId)) {
      value = QualitativePerformance.Good;
      label = 'Correct cast';
    } else if (okSpells.includes(spellId)) {
      value = QualitativePerformance.Ok;
      label = 'Ok cast';
    } else {
      value = QualitativePerformance.Fail;
      label = 'Incorrect cast';
    }

    this.castEntries[kind].push({
      value,
      tooltip: (
        <>
          {label}: buffed <SpellLink spell={spellId} />
        </>
      ),
    });
  }

  statistic() {
    const talent = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.ANCESTRAL_SWIFTNESS_TALENT)
      ? TALENTS_SHAMAN.ANCESTRAL_SWIFTNESS_TALENT
      : TALENTS_SHAMAN.NATURES_SWIFTNESS_TALENT;

    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <TalentSpellText talent={talent}>
          <div>
            <ItemManaGained amount={this.manaSaved} useAbbrev customLabel="mana" />
          </div>
          <div>
            {formatNumber(this.avgManaSaved)} <small>mana saved per cast</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_SHAMAN.NATURES_SWIFTNESS_TALENT} />
        </b>{' '}
        is a very important spell as every cast gives you one{' '}
        <SpellLink spell={SPELLS.STORMSTREAM_TOTEM} />. It can also save you a substantial amount of
        mana over the course of a fight. You should aim to use it on your most expensive spells,
        like <SpellLink spell={TALENTS_SHAMAN.CHAIN_HEAL_TALENT} />. Using it with{' '}
        <SpellLink spell={SPELLS.HEALING_WAVE} /> could also save a life.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_SHAMAN.NATURES_SWIFTNESS_TALENT} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            <p>
              <CastEfficiencyBar
                spell={TALENTS_SHAMAN.NATURES_SWIFTNESS_TALENT}
                useThresholds
                gapHighlightMode={GapHighlight.FullCooldown}
              />{' '}
            </p>
            <strong>Casts </strong>
            <small>
              - Green indicates a good use of the{' '}
              <SpellLink spell={TALENTS_SHAMAN.NATURES_SWIFTNESS_TALENT} /> buff, Yellow indicates
              an ok use, and Red is an incorrect use.
            </small>
            <PerformanceBoxRow values={this.castEntries.ns} />
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  get farseerGuideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_SHAMAN.ANCESTRAL_SWIFTNESS_TALENT} />
        </b>{' '}
        is a crucial spell for Farseer Shamans. You should aim to cast this on cooldown to maximize
        your Ancestor uptime through{' '}
        <SpellLink spell={TALENTS_SHAMAN.CALL_OF_THE_ANCESTORS_TALENT} /> and how many{' '}
        <SpellLink spell={TALENTS_SHAMAN.STORMSTREAM_TOTEM_3_RESTORATION_TALENT} /> you generate.
        You should aim to use it on your most expensive spells, like{' '}
        <SpellLink spell={TALENTS_SHAMAN.CHAIN_HEAL_TALENT} />. Avoid using it with{' '}
        <SpellLink spell={SPELLS.HEALING_WAVE} /> or DPS spells such as{' '}
        <SpellLink spell={TALENTS_SHAMAN.LAVA_BURST_TALENT} /> or{' '}
        <SpellLink spell={SPELLS.LIGHTNING_BOLT} />.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_SHAMAN.ANCESTRAL_SWIFTNESS_TALENT} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            <p>
              <CastEfficiencyBar
                spell={SPELLS.ANCESTRAL_SWIFTNESS_CAST}
                useThresholds
                minimizeIcons
                gapHighlightMode={GapHighlight.FullCooldown}
              />{' '}
            </p>
            <strong>Casts </strong>
            <small>
              - Green indicates a good use of the{' '}
              <SpellLink spell={TALENTS_SHAMAN.ANCESTRAL_SWIFTNESS_TALENT} /> buff, Yellow indicates
              an ok use, and Red is an incorrect use.
            </small>
            <PerformanceBoxRow values={this.castEntries.as} />
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

export default NaturesSwiftness;
