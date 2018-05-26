import React from 'react';
import PropTypes from 'prop-types';

import TooltipProvider from 'common/TooltipProvider';

import ITEMS from './ITEMS';
import getItemQualityLabel from './getItemQualityLabel';
import ItemIcon from './ItemIcon';

class ItemLink extends React.PureComponent {
  static propTypes = {
    id: PropTypes.number.isRequired,
    children: PropTypes.node,
    details: PropTypes.object,
    quality: PropTypes.number,
    icon: PropTypes.bool,
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
    const { id, children, details, icon, ...others } = this.props;
    delete others.quality;

    let quality = this.props.quality;
    if (quality === undefined || quality === null) {
      quality = ITEMS[id] ? ITEMS[id].quality : 0;
    }

    return (
      <a
        href={TooltipProvider.item(id, details)}
        target="_blank"
        rel="noopener noreferrer"
        className={getItemQualityLabel(quality)}
        ref={elem => {
          this.elem = elem;
        }}
        {...others}
      >
        {icon && <ItemIcon id={id} noLink />}{' '}
        {children || ITEMS[id].name}
      </a>
    );
  }
}

export default ItemLink;
