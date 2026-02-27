import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { TALENTS_DRUID } from 'common/TALENTS';
import { isFromEverbloom } from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Lifebloom from './Lifebloom';

class Everbloom extends Analyzer {
	static dependencies = {
		lifebloom: Lifebloom,
	};

	lifebloom!: Lifebloom;

	splashHealing = 0;
	stackBonusHealing = 0;
	everbloomBloomHealing = 0;
	everbloomBloomCount = 0;

	private hasAnyEverbloomTalent = false;
	private hasRank2Talent = false;
	private hasRank3Talent = false;

	constructor(options: Options) {
		super(options);

		this.hasAnyEverbloomTalent =
			this.selectedCombatant.hasTalent(TALENTS_DRUID.EVERBLOOM_1_RESTORATION_TALENT) ||
			this.selectedCombatant.hasTalent(TALENTS_DRUID.EVERBLOOM_2_RESTORATION_TALENT) ||
			this.selectedCombatant.hasTalent(TALENTS_DRUID.EVERBLOOM_3_RESTORATION_TALENT);
		this.hasRank2Talent =
			this.selectedCombatant.hasTalent(TALENTS_DRUID.EVERBLOOM_2_RESTORATION_TALENT) ||
			this.selectedCombatant.hasTalent(TALENTS_DRUID.EVERBLOOM_3_RESTORATION_TALENT);
		this.hasRank3Talent = this.selectedCombatant.hasTalent(
			TALENTS_DRUID.EVERBLOOM_3_RESTORATION_TALENT,
		);
		this.active = true;
		this.addEventListener(
			Events.heal
				.by(SELECTED_PLAYER)
				.spell(SPELLS.LIFEBLOOM_HOT_HEAL),
			this.onLifebloomHeal,
		);
		this.addEventListener(
			Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EVERBLOOM_SPLASH_HEAL),
			this.onSplashHeal,
		);
		this.addEventListener(
			Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIFEBLOOM_BLOOM_HEAL),
			this.onLifebloomBloomHeal,
		);
	}

	private onLifebloomHeal = (event: HealEvent) => {
		if (!this.hasRank1Effective) {
			return;
		}

		const effectiveHeal = event.amount + (event.absorbed || 0);
		const stacks = Math.max(1, this.lifebloom.lifebloomStacks);
		if (stacks <= 1) {
			return;
		}

		this.stackBonusHealing += effectiveHeal * ((stacks - 1) / stacks);
	};

	private onSplashHeal = (event: HealEvent) => {
		this.splashHealing += event.amount + (event.absorbed || 0);
	};

	private onLifebloomBloomHeal = (event: HealEvent) => {
		if (!isFromEverbloom(event)) {
			return;
		}

		this.everbloomBloomHealing += event.amount + (event.absorbed || 0);
		this.everbloomBloomCount += 1;
	}

	private get hasAnyEverbloomEffective() {
		return this.hasRank1Enabled || this.hasRank2Enabled || this.hasRank3Enabled;
	}

	private get hasRank1Effective() {
		return this.lifebloom.hasEverbloomRank1Effective;
	}

	private get hasRank1Enabled() {
		return this.hasAnyEverbloomTalent || this.hasRank1Effective;
	}

	private get hasRank2Enabled() {
		return this.hasRank2Talent || this.splashHealing > 0;
	}

	private get hasRank3Enabled() {
		return this.hasRank3Talent || this.everbloomBloomCount > 0;
	}

	private get displayTalent() {
		if (this.hasRank3Enabled) {
			return TALENTS_DRUID.EVERBLOOM_3_RESTORATION_TALENT;
		}
		if (this.hasRank2Enabled) {
			return TALENTS_DRUID.EVERBLOOM_2_RESTORATION_TALENT;
		}
		return TALENTS_DRUID.EVERBLOOM_1_RESTORATION_TALENT;
	}

	get totalEverbloomHealing() {
		return this.stackBonusHealing + this.splashHealing + this.everbloomBloomHealing;
	}

	statistic() {
		if (!this.hasAnyEverbloomTalent && !this.hasAnyEverbloomEffective && this.totalEverbloomHealing <= 0) {
			return null;
		}

		return (
			<Statistic
				size="flexible"
				position={STATISTIC_ORDER.OPTIONAL(11)}
				category={STATISTIC_CATEGORY.TALENTS}
				tooltip={
					<>
						<strong>Everbloom healing breakdown</strong>
						<ul>
							{this.hasRank1Enabled && (
								<li>
									Rank 1 stack bonus healing:{' '}
									<strong>{formatNumber(this.stackBonusHealing)}</strong>
								</li>
							)}
							{this.hasRank2Enabled && (
								<li>
									Rank 2 splash healing: <strong>{formatNumber(this.splashHealing)}</strong>
								</li>
							)}
							{this.hasRank3Enabled && (
								<>
									<li>
										Rank 3 Blooming Frenzy healing:{' '}
										<strong>{formatNumber(this.everbloomBloomHealing)}</strong>
									</li>
									<li>
										Rank 3 linked blooms: <strong>{this.everbloomBloomCount}</strong>
									</li>
								</>
							)}
						</ul>
					</>
				}
			>
				<BoringSpellValueText spell={this.displayTalent}>
					<ItemPercentHealingDone amount={this.totalEverbloomHealing} />
				</BoringSpellValueText>
			</Statistic>
		);
	}
}

export default Everbloom;
