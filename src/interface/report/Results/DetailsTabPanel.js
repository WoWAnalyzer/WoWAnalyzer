import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import './DetailsTabPanel.css';

class DetailsTabPanel extends React.Component {
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
    const { tabs: unsortedTabs, selected, makeTabUrl, ...others } = this.props;

    const tabs = unsortedTabs.sort((a, b) => {
      const aOrder = a.order !== undefined ? a.order : 100;
      const bOrder = b.order !== undefined ? b.order : 100;

      return aOrder - bOrder;
    });

    const tabUrl = selected || tabs[0].url;
    const activeTab = tabs.find(tab => tab.url === tabUrl) || tabs[0];

    return (
      <div className="panel details-tab-panel" {...others}>
        <div className="panel-body">
          <menu>
            {tabs.map(tab => (
              <Link
                key={tab.title}
                to={makeTabUrl(tab.url)}
                className={activeTab.url === tab.url ? 'btn-link selected' : 'btn-link'}
              >
                {tab.title}
              </Link>
            ))}
          </menu>
          <main>
            {activeTab.render()}
          </main>
        </div>
      </div>
    );
  }
}

export default DetailsTabPanel;
