import React from 'react';
import PropTypes from 'prop-types';

import TooltipProvider from 'Interface/common/TooltipProvider';

import SPELLS from './SPELLS';
import SpellIcon from './SpellIcon';

class SpellLink extends React.PureComponent {
  static propTypes = {
    id: PropTypes.number.isRequired,
    children: PropTypes.node,
    category: PropTypes.string,
    icon: PropTypes.bool,
    iconStyle: PropTypes.object,
    ilvl: PropTypes.number,
  };
  static defaultProps = {
    icon: true,
  };

  elem = null;

  componentDidMount() {
    this.componentDidUpdate();
  }
  componentDidUpdate() {
    TooltipProvider.refresh(this.elem);
  }

  render() {
    const { id, children, category = undefined, icon, iconStyle, ilvl, ...other } = this.props;

    if (process.env.NODE_ENV === 'development' && !children && !SPELLS[id]) {
      throw new Error(`Unknown spell: ${id}`);
    }

    const tooltipDetails = {};
    if (ilvl) {
      tooltipDetails.ilvl = ilvl;
    }

    return (
      <a
        href={TooltipProvider.spell(id, tooltipDetails)}
        target="_blank"
        rel="noopener noreferrer"
        className={category}
        ref={elem => {
          this.elem = elem;
        }}
        {...other}
      >
        {icon && <SpellIcon id={id} noLink style={iconStyle} alt="" />}{' '}
        {children || (SPELLS[id] ? SPELLS[id].name : `Unknown spell: ${id}`)}
      </a>
    );
  }
}

export default SpellLink;
