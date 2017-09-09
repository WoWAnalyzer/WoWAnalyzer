import React from 'react';

import Icon from 'common/Icon';
import SPELLS from 'common/SPELLS';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import { formatThousands, formatNumber } from 'common/format';

import CoreDamageDone from 'Parser/Core/Modules/DamageDone';
import CallToTheVoid from '../Spells/CallToTheVoid';
import Mindbender from '../Spells/Mindbender';
import Shadowfiend from '../Spells/Shadowfiend';


class DamageDone extends CoreDamageDone {
	static dependencies = {
		callToTheVoid: CallToTheVoid,
		mindbender: Mindbender,
		shadowfiend: Shadowfiend,
	};

	on_initialized(){
		this.active = true;
	}

	statistic() {
			return (<StatisticBox
			icon={<Icon icon="class_priest" alt="DPS stats" />}
			value={`${formatNumber(this.total.effective / this.owner.fightDuration * 1000)} DPS`}
			label={(
				<dfn data-tip={`The total damage done recorded was ${formatThousands(this.total.effective)}.`}>Damage done</dfn>
			)}
		/>);
	}

	on_finished(){
		this._total = this._total.add(this.callToTheVoid.damageDone || 0, 0, 0);
		this.owner.modules.combatants.selected.hasTalent(SPELLS.MINDBENDER_TALENT_SHADOW.id) ?
			this._total = this._total.add(this.mindbender.damageDone || 0, 0, 0) :
			this._total = this._total.add(this.shadowfiend.damageDone || 0, 0, 0);
	}

	statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default DamageDone;