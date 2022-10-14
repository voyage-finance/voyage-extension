import { Box, Group } from '@mantine/core';
import { getTxExplorerLink } from '@utils/env';
import * as React from 'react';
import { ArrowUpRight, Check, X } from 'tabler-icons-react';

const StatusIcon: React.FC<{
  tx?: string;
  isNext?: boolean;
  isLiquidated?: boolean;
}> = ({ tx, isNext, isLiquidated }) => {
  const onClick = () => {
    if (tx) window.open(getTxExplorerLink(tx), '_blank');
  };
  return tx ? (
    <Group
      sx={{
        borderRadius: '50%',
        background: 'rgba(12, 205, 170, 1)',
        height: 43,
        width: 43,
        color: 'white',
        ':hover': {
          cursor: 'pointer',
          background: 'rgba(12, 205, 170, 0.9)',
        },
      }}
      align="center"
      position="center"
      onClick={onClick}
    >
      <ArrowUpRight size={20} />
    </Group>
  ) : isLiquidated ? (
    <Group
      sx={{
        border: '3px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        width: 43,
        height: 43,
        color: 'rgba(255, 255, 255, 0.35)',
      }}
      align="center"
      position="center"
    >
      <X size={20} />
    </Group>
  ) : isNext ? (
    <Group
      sx={{
        borderRadius: '50%',
        height: 43,
        width: 43,
        color: 'white',
        background: 'linear-gradient(90deg, #FFA620 0%, #EF5B25 100%)',
        position: 'relative',
      }}
      align="center"
      position="center"
    >
      <Check size={20} />
      <Box
        sx={{
          borderRadius: '50%',
          width: '100%',
          height: '100%',
          position: 'absolute',
          border: '3px solid rgba(255, 255, 255, 0.35)',
        }}
      />
    </Group>
  ) : (
    <Group
      sx={{
        border: '3px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        width: 43,
        height: 43,
        color: 'rgba(255, 255, 255, 0.35)',
      }}
      align="center"
      position="center"
    >
      <Check size={20} />
    </Group>
  );
};

export default StatusIcon;
