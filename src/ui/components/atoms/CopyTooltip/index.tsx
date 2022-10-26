import { Tooltip, TooltipProps } from '@mantine/core';
import * as React from 'react';

interface ICopyTooltipProps extends Omit<TooltipProps, 'label'> {
  copied?: boolean;
}

const CopyTooltip: React.FunctionComponent<ICopyTooltipProps> = ({
  copied,
  children,
  ...props
}) => {
  return (
    <Tooltip
      label={copied ? 'Copied!' : 'Click to copy'}
      withArrow
      position="bottom"
      styles={{
        body: {
          width: '100px !important',
          background: '#fff',
          textAlign: 'center',
        },
        arrow: {
          background: '#fff',
        },
      }}
      {...props}
    >
      {children}
    </Tooltip>
  );
};

export default CopyTooltip;
