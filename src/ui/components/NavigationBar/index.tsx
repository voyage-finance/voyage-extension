import { Box, Group } from '@mantine/core';
import * as React from 'react';
import DiscoverIconSrc from '@images/navigation/menu-discover.svg';
import DiscoverActiveIconSrc from '@images/navigation/menu-discover-active.svg';
import PaperIconSrc from '@images/navigation/menu-paper.svg';
import PaperActiveIconSrc from '@images/navigation/menu-paper-active.svg';
import SteeringIconSrc from '@images/navigation/menu-steering.svg';
import SteeringActiveIconSrc from '@images/navigation/menu-steering-active.svg';
import SwordIconSrc from '@images/navigation/menu-sword.svg';
import SwordActiveIconSrc from '@images/navigation/menu-sword-active.svg';
import styles from './index.module.scss';
import cn from 'classnames';
import { useLocation, useNavigate } from 'react-router-dom';

type NavigationItem = {
  path: string;
  icon: string;
  iconActive: string;
};

const items: NavigationItem[] = [
  {
    path: '/home',
    icon: DiscoverIconSrc,
    iconActive: DiscoverActiveIconSrc,
  },
  {
    path: '/sword',
    icon: SwordIconSrc,
    iconActive: SwordActiveIconSrc,
  },
  {
    path: '/loans',
    icon: PaperIconSrc,
    iconActive: PaperActiveIconSrc,
  },
  {
    path: '/settings',
    icon: SteeringIconSrc,
    iconActive: SteeringActiveIconSrc,
  },
];

const NavigationBar: React.FunctionComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <Group px={30} mt="auto" className={styles.navigation} spacing={0}>
      {items.map((item, index) => {
        const isActiveTab = location.pathname.startsWith(item.path);
        return (
          <Box
            className={cn(styles.navigationItem, isActiveTab && styles.active)}
            key={index}
            onClick={() => navigate(item.path)}
          >
            <img
              src={isActiveTab ? item.iconActive : item.icon}
              className={styles.icon}
            />
            <div className={styles.border} />
          </Box>
        );
      })}
    </Group>
  );
};

export default NavigationBar;
