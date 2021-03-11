import { WCLFightsResponse } from 'common/WCL_TYPES';
import { useWclApi } from 'api/useWclApi';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setReport } from 'interface/actions/report';
import Report from 'parser/core/Report';

export const useReport = (code: string, translate = true) => {
  const dispatch = useDispatch();

  const query = {
    // so long as we don't have the entire site localized, it's better to have 1 consistent language
    translate: translate ? true : undefined,
  };

  const convert = (data: WCLFightsResponse): Report => ({ ...data, code });

  const result = useWclApi<WCLFightsResponse, Report>(
    `report/fights/${code}`,
    { query, convert },
  );

  const { data } = result;

  useEffect(() => {
    dispatch(setReport(data || null));
  }, [data, dispatch]);

  return result;
};
