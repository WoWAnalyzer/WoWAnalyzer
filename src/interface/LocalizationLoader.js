import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getLanguage } from 'interface/selectors/language';

class LocalizationLoader extends React.PureComponent {
  static propTypes = {
    language: PropTypes.string,
    children: PropTypes.func.isRequired,
  };
  state = {
    catalogs: {},
  };

  componentDidMount() {
    // noinspection JSIgnoredPromiseFromCall
    this.loadCatalog(this.props.language);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.language !== this.props.language) {
      // noinspection JSIgnoredPromiseFromCall
      this.loadCatalog(this.props.language);
    }
  }

  async loadCatalog(language) {
    const catalog = await import(/* webpackMode: "lazy", webpackChunkName: "locale-[request]" */ `@lingui/loader!localization/${language}/messages.json`);

    this.setState(state => ({
      catalogs: {
        ...state.catalogs,
        [language]: catalog,
      },
    }));
  }

  render () {
    const { children, language } = this.props;
    const { catalogs } = this.state;

    return children({ language, catalogs });
  }
}

const mapStateToProps = state => ({
  language: getLanguage(state),
});
export default connect(mapStateToProps)(LocalizationLoader);
