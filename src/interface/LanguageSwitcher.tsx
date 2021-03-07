import { t } from '@lingui/macro';
import { setLanguage } from 'interface/actions/language';
import ReadableListing from 'interface/ReadableListing';
import { getLanguage } from 'interface/selectors/language';
import { TooltipElement } from 'interface/Tooltip';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import languages from './languages';

const LanguageSwitcher = () => {
  const [expanded, setExpanded] = useState(false);

  const language = useSelector(getLanguage);
  const dispatch = useDispatch();

  const selectLanguage = (code: string) => {
    setExpanded(false);
    dispatch(setLanguage(code));
  };

  if (expanded) {
    return (
      <ReadableListing groupType="or">
        {Object.keys(languages).map((code) => (
          <a key={code} onClick={() => selectLanguage(code)}>
            {/* eslint-disable-line jsx-a11y/anchor-is-valid */}
            {languages[code].localName}
          </a>
        ))}
      </ReadableListing>
    );
  }

  return (
    <a onClick={() => setExpanded(true)}>
      {/* eslint-disable-line jsx-a11y/anchor-is-valid */}
      <TooltipElement
        content={t({
          id: 'interface.languageSwitcher.clickToSwitch',
          message: `Click to switch languages. We've only just started localizing the app, it will take some time until everything is localized.`,
        })}
      >
        {languages[language].localName}
      </TooltipElement>
    </a>
  );
};

export default LanguageSwitcher;
