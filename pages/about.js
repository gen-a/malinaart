import { Component } from 'react';
import Router from 'next/router';

class About extends Component {
  static async getInitialProps({ req, query }) {
    const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;
    return { userAgent, query, isServer: !!req }
  }

  render() {
    return (
      <div>
        <h1>Hello World  Is it on server? - {this.props.isServer ? 'Yes' : 'No'}</h1>

        {this.props.query.slug}
        <button type="button" onClick={() => Router.push('/')}>
          Reload me
        </button>

        </div>

    );
  }
}

export default About