import fetchWcl from 'api/fetchWclApi';
import makeWclApiUrl from 'api/makeWclApiUrl';
import { WCLResponseJSON } from 'api/WCL_TYPES';
import { captureException } from 'common/errorLogger';
import { LogNotFoundError } from 'common/fetchWclApi';
import { useRef } from 'react';
import useSWR from 'swr';
import { Fetcher } from 'swr/dist/types';

const useApi = <Converted>(url: string, fetcher: Fetcher<Converted>) =>
  useSWR<Converted>(url, fetcher, {
    onError: (error) => {
      const isCommonError = error instanceof LogNotFoundError;
      if (!isCommonError) {
        captureException(error);
      }
    },
  });

export const useWclApi = <Data extends WCLResponseJSON, Converted = Data>(
  path: string,
  {
    query = {},
    convert = (data: any) => data,
  }: {
    query?: Record<string, any>;
    convert?: (data: any) => Converted;
  } = {},
) => {
  const timestampRef = useRef<number>();
  if (timestampRef.current) {
    query['_'] = timestampRef.current;
  }

  const result = useApi<Converted>(makeWclApiUrl(path, query), (url) =>
    fetchWcl<Data>(url).then(convert),
  );

  const { mutate } = result;
  const forceMutate = () => {
    timestampRef.current = Number(new Date());
    return mutate();
  };

  return { ...result, forceMutate };
};
