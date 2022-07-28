import { Box, Group } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import { ReactComponent as Voyage } from '@images/logo-menu.svg';

const Onboard: React.FC = () => {
  return (
    <Group direction="column" position="apart">
      <Outlet />
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          bottom: 0,
          translate: '-50% 0',
        }}
      >
        <Voyage style={{ width: 75 }} />
      </Box>
    </Group>
  );
};

export default Onboard;
