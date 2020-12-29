import React from 'react';
import PropTypes from 'prop-types';

import { formatNumber } from 'common/format';
import InsanityIcon from 'interface/icons/Insanity';
import CombatLogParser from 'parser/core/CombatLogParser';

interface Props {
  amount: number;
  approximate?: boolean;
}
interface Context {
  parser: CombatLogParser;
}

const ItemInsanityGained = (
  { amount, approximate }: Props,
  { parser }: Context,
) => (
  <>
    <InsanityIcon /> {approximate && '≈'}
    {formatNumber(amount)}
    <small> Insanity Generated</small>
  </>
);
ItemInsanityGained.contextTypes = {
  parser: PropTypes.object.isRequired,
};

export default ItemInsanityGained;
