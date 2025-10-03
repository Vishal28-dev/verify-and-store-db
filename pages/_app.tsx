import type { AppProps } from 'next/app';
import NextNProgress from 'nextjs-progressbar';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* The fix is to remove the "options" prop.
        I also updated the color to match your site's theme.
      */}
      <NextNProgress color="#8a63d2" />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;