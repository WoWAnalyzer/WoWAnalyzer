import { formatNumber } from 'common/format';
import InsanityIcon from 'interface/icons/Insanity';
import CombatLogParser from 'parser/core/CombatLogParser';
import PropTypes from 'prop-types';
import React from 'react';

interface Props {
  amount: number;
  approximate?: boolean;
}
interface Context {
  parser: CombatLogParser;
}

const ItemInsanityGained = ({ amount, approximate }: Props, { parser }: Context) => (
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
