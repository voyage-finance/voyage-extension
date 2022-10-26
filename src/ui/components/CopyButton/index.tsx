import CopyTooltip from '@components/atoms/CopyTooltip';
import { Box, BoxProps } from '@mantine/core';
import { ReactComponent as CopySvg } from 'assets/img/copy-icon.svg';
import { useState } from 'react';

type IProps = BoxProps<'div'> & {
  text: string;
};

const CopyButton: React.FC<IProps> = ({ text, sx, ...props }) => {
  const [copied, setCopied] = useState(false);
  const onClickHandler = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
  };
  return (
    <CopyTooltip copied={copied} position="top">
      <Box
        sx={{ cursor: 'pointer', ...sx }}
        onClick={onClickHandler}
        onMouseLeave={() => setCopied(false)}
        {...props}
      >
        <CopySvg />
      </Box>
    </CopyTooltip>
  );
};

export default CopyButton;
