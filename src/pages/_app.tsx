import React from 'react';
import { RecoilRoot } from 'recoil';
import { AppProps, NextWebVitalsMetric } from 'next/app';
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Hydrate } from 'react-query/hydration';
import { CSSReset } from '@chakra-ui/react';
import { appWithTranslation } from 'next-i18next';

import { GlobalStyles, Chakra } from '@/components/common';
import { theme } from '@/theme/index';
import { gtag } from '@/utils/analytics';

const isServerSideRendered = () => typeof window === 'undefined';

if (!isServerSideRendered() && process.env.NODE_ENV !== 'production') {
  import('react-dom').then((ReactDOM) => {
    import('@axe-core/react').then((axe) => {
      axe.default(React, ReactDOM, 1000);
    });
  });
}

const Noop: React.FC = ({ children }) => <>{children}</>;

export default appWithTranslation(App);

function App({ Component, pageProps }: AppProps): React.ReactElement {
  const TWENTY_FOUR_HOURS_MS = 86400000;

  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            retry: false,
            staleTime: TWENTY_FOUR_HOURS_MS
          }
        }
      })
  );

  // eslint-disable-next-line
  const LayoutNoop = (Component as any).LayoutNoop || Noop;
  // remove chrome-bug.css loading class on FCP
  React.useEffect(() => {
    document.body.classList?.remove('loading');
  }, []);

  const router = useRouter();

  React.useEffect(() => {
    const handleRouteChange = (url: URL) => {
      gtag.pageView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <Chakra cookies={pageProps.cookies} theme={theme}>
          <GlobalStyles />
          <CSSReset />
          <ReactQueryDevtools />

          <LayoutNoop pageProps={pageProps}>
            <RecoilRoot>
              <Component {...pageProps} />
            </RecoilRoot>
          </LayoutNoop>
        </Chakra>
      </Hydrate>
    </QueryClientProvider>
  );
}

export function reportWebVitals(metric: NextWebVitalsMetric): void {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line
    console.log(`${metric.name}: `, metric);
  }
}