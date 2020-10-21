import React, { ReactNode } from 'react';
import { connect } from 'react-redux';

import retryingPromise from 'common/retryingPromise';
import { getLanguage } from 'interface/selectors/language';
import { Catalogs } from '@lingui/core';

type Props = {
  language: string;
  children: (c: { language: string, catalogs: Catalogs }) => ReactNode;
}
type State = {
  catalogs: Catalogs;
}

class LocalizationLoader extends React.PureComponent<Props, State> {
  state = {
    catalogs: {},
  };

  componentDidMount() {
    // noinspection JSIgnoredPromiseFromCall
    this.loadCatalog(this.props.language);
  }
  componentDidUpdate(prevProps: Props) {
    if (prevProps.language !== this.props.language) {
      // noinspection JSIgnoredPromiseFromCall
      this.loadCatalog(this.props.language);
    }
  }

  async loadCatalog(language: string) {
    const catalog = await retryingPromise(() => import(/* webpackMode: "lazy", webpackChunkName: "locale-[request]" */ `@lingui/loader!localization/${language}/messages.json`));

    this.setState(state => ({
      catalogs: {
        ...state.catalogs,
        [language]: catalog,
      },
    }));
  }

  render() {
    const { children, language } = this.props;
    const { catalogs } = this.state;
    return children({ language, catalogs });
  }
}

const mapStateToProps = (state: State) => ({
  language: getLanguage(state),
});
export default connect(mapStateToProps)(LocalizationLoader);
