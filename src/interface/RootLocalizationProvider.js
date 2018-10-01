import React from 'react';
import PropTypes from 'prop-types';
import { I18nProvider } from '@lingui/react';

import LocalizationLoader from './LocalizationLoader';

class RootLocalizationProvider extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  render() {
    return (
      <LocalizationLoader>
        {({ language, catalogs }) => (
          <I18nProvider language={language} catalogs={catalogs}>
            {this.props.children}
          </I18nProvider>
        )}
      </LocalizationLoader>
    );
  }
}

export default RootLocalizationProvider;
