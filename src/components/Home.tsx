import React from 'react';
import { Link } from 'react-router-dom';

const Card = ({ title, linkTo, children }: { title: string, linkTo: string, children: any}) => {
    return (
      <div className="card">
        <h3>{title}</h3>
        <div>{children}</div>
        <Link to={linkTo}>Go to Page</Link>
      </div>
    );
  };

const Home = () => {
    return (
      <div>
        <h1>Home Page</h1>
        <Card title="Electricity Usage" linkTo="/electricity-usage">
          <p>View your electricity usage over time.</p>
        </Card>
        <Card title="Load Shedding" linkTo="/loadshedding">
          <p>View upcoming load-shedding times.</p>
        </Card>
      </div>
    );
  };
  
  export default Home;
  