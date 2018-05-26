import React from 'react';
import PropTypes from 'prop-types';

import TooltipProvider from 'common/TooltipProvider';

import SPELLS from './SPELLS';
import SpellIcon from './SpellIcon';

class SpellLink extends React.PureComponent {
  static propTypes = {
    id: PropTypes.number.isRequired,
    children: PropTypes.node,
    category: PropTypes.string,
    icon: PropTypes.bool,
    iconStyle: PropTypes.object,
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
    const { id, children, category = undefined, icon, iconStyle, ...other } = this.props;

    if (process.env.NODE_ENV === 'development' && !children && !SPELLS[id]) {
      throw new Error(`Unknown spell: ${id}`);
    }

    return (
      <a
        href={TooltipProvider.spell(id)}
        target="_blank"
        rel="noopener noreferrer"
        className={category}
        ref={elem => {
          this.elem = elem;
        }}
        {...other}
      >
        {icon && <SpellIcon id={id} noLink style={iconStyle} />}{' '}
        {children || (SPELLS[id] ? SPELLS[id].name : `Unknown spell: ${id}`)}
      </a>
    );
  }
}

export default SpellLink;
