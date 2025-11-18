import { MessageDescriptor } from '@lingui/core';
import { useHead } from '@unhead/react';
import { useLingui } from '@lingui/react';
import { isMessageDescriptor } from 'localization/isMessageDescriptor';

const siteName = 'WoWAnalyzer';

interface DocumentTitleProps {
  title?: string | MessageDescriptor;
}

const DocumentTitle = ({ title }: DocumentTitleProps) => {
  const { i18n } = useLingui();

  useHead({
    title: () => (isMessageDescriptor(title) ? i18n._(title) : (title ?? siteName)),
  });

  return null;
};

export default DocumentTitle;
