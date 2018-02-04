import React from 'react';
import PropTypes from 'prop-types';

import ItemLink from 'common/ItemLink';
import ItemIcon from 'common/ItemIcon';
import ArmorIcon from 'Icons/Armor';

const ItemsPanel = ({ items, selectedCombatant }) => (
  <div className="panel items">
    <div className="panel-heading">
      <h2>
        <dfn data-tip="The values shown are only for the special equip effects of the items. The passive gain from the stats is <b>not</b> included.">
          <ArmorIcon /> Item bonuses
        </dfn>
      </h2>
    </div>
    <div className="panel-body" style={{ padding: 0 }}>
      <ul className="list">
        {items.length === 0 && (
          <li className="item clearfix" style={{ paddingTop: 20, paddingBottom: 20 }}>
            No noteworthy items.
          </li>
        )}
        {
          items
            .sort((a, b) => {
              // raw elements always rendered last
              if (React.isValidElement(a)) {
                return 1;
              } else if (React.isValidElement(b)) {
                return -1;
              } else if (a.item && b.item) {
                if (a.item.quality === b.item.quality) {
                  // Qualities equal = show last added item at bottom
                  return a.item.id - b.item.id;
                }
                // Show lowest quality item at bottom
                return a.item.quality < b.item.quality;
              } else if (a.item) {
                return -1;
              } else if (b.item) {
                return 1;
              }
              // Neither is an actual item, sort by id so last added effect is shown at bottom
              if (a.id < b.id) {
                return -1;
              } else if (a.id > b.id) {
                return 1;
              }
              return 0;
            })
            .map(item => {
              if (!item) {
                return null;
              } else if (React.isValidElement(item)) {
                return item;
              }

              const id = item.id || item.item.id;
              const itemDetails = id && selectedCombatant.getItem(id);
              const icon = item.icon || <ItemIcon id={item.item.id} details={itemDetails} />;
              const title = item.title || <ItemLink id={item.item.id} details={itemDetails} />;

              return (
                <li className="item clearfix" key={id}>
                  <article>
                    <figure>
                      {icon}
                    </figure>
                    <div>
                      <header>
                        {title}
                      </header>
                      <main>
                        {item.result}
                      </main>
                    </div>
                  </article>
                </li>
              );
            })
        }
      </ul>
    </div>
  </div>
);
ItemsPanel.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    item: PropTypes.shape({
      id: PropTypes.number.isRequired,
      quality: PropTypes.number.isRequired,
      icon: PropTypes.node,
      title: PropTypes.node,
      result: PropTypes.node,
    }),
  })).isRequired,
  selectedCombatant: PropTypes.shape({
    getItem: PropTypes.func.isRequired,
  }).isRequired,
};

export default ItemsPanel;
