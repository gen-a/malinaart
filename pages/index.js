import Link from 'next/link';
import Router from 'next/router';

function Home({isServer}) {
  console.log('render', new Date());
  return (
    <div>
      <h1>Welcome to Next.js! Is it on server? - {isServer ? 'Yes' : 'No'}</h1>
      <Link href="/test?slug=something" as="/test/something">
        <a>here</a>
      </Link>

      <button type="button" onClick={() => Router.push('/about')}>
        Reload me
      </button>
  </div>
  );

}

Home.getInitialProps = async ({ req }) => {
  const res = await fetch('/api/data.json');
  const data = await res.json();
  return { isServer: !!req, data };
};


export default Home;