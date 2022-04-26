import React from 'react';
import { Button } from '@mantine/core';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div>
      Home
      <div>
        <Button component={Link} to="/connect">
          Connect a signer
        </Button>
      </div>
    </div>
  );
};

export default Home;
