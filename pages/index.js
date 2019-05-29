import Link from 'next/link';
import Router from 'next/router';
import {getRequest} from '../services/axios-request';


function Home({isServer, data}) {
  console.log('render', new Date());
  return (
    <div>
      <h1>Welcome to Next.js! Is it on server? - {isServer ? 'Yes' : 'No'} {data.foo} </h1>
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
  const data = await getRequest('http://localhost:3000/api');
  return { isServer: !!req, data };
};


export default Home;