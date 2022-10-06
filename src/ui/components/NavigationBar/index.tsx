import { Box, Group } from '@mantine/core';
import * as React from 'react';
import DiscoverIconSrc from '@images/navigation/menu-discover.svg';
import PaperIconSrc from '@images/navigation/menu-paper.svg';
import SteeringIconSrc from '@images/navigation/menu-steering.svg';
import SwordIconSrc from '@images/navigation/menu-sword.svg';
import styles from './index.module.scss';
import cn from 'classnames';
import { useLocation, useNavigate } from 'react-router-dom';

type NavigationItem = {
  path: string;
  icon: string;
};

const items: NavigationItem[] = [
  {
    path: '/',
    icon: DiscoverIconSrc,
  },
  {
    path: '/sword',
    icon: SwordIconSrc,
  },
  {
    path: '/loans',
    icon: PaperIconSrc,
  },
  {
    path: '/settings',
    icon: SteeringIconSrc,
  },
];

const NavigationBar: React.FunctionComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <Group px={30} mt="auto" className={styles.navigation} spacing={0}>
      {items.map((item, index) => {
        return (
          <Box
            className={cn(
              styles.navigationItem,
              location.pathname == item.path && styles.active
            )}
            key={index}
            onClick={() => navigate(item.path)}
          >
            <img src={item.icon} className={styles.icon} />
            <div className={styles.border} />
          </Box>
        );
      })}
    </Group>
  );
};

export default NavigationBar;
