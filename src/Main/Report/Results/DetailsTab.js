import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

class DetailsTab extends React.Component {
  static propTypes = {
    tabs: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.node.isRequired,
      url: PropTypes.string.isRequired,
      order: PropTypes.number,
    })).isRequired,
    selected: PropTypes.string,
    makeTabUrl: PropTypes.func.isRequired,
  };
  render() {
    const { tabs, selected, makeTabUrl } = this.props;

    const tabUrl = selected || tabs[0].url;
    const activeTab = tabs.find(tab => tab.url === tabUrl) || tabs[0];

    return (
      <div className="panel tabbed" style={{ marginTop: 15, marginBottom: 100 }}>
        <div className="panel-body flex" style={{ flexDirection: 'column', padding: '0' }}>
          <div className="navigation item-divider">
            <div className="flex" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {tabs
                .sort((a, b) => {
                  const aOrder = a.order !== undefined ? a.order : 100;
                  const bOrder = b.order !== undefined ? b.order : 100;

                  return aOrder - bOrder;
                })
                .map(tab => (
                  <Link
                    key={tab.title}
                    to={makeTabUrl(tab.url)}
                    className={activeTab.url === tab.url ? 'btn-link selected' : 'btn-link'}
                  >
                    {tab.title}
                  </Link>
                ))}
            </div>
          </div>
          <div>
            {activeTab.render()}
          </div>
        </div>
      </div>
    );
  }
}

export default DetailsTab;
