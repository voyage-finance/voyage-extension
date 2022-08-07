import { Box, BoxProps } from '@mantine/core';
import { ReactComponent as CopySvg } from 'assets/img/copy-icon.svg';
import browser from 'webextension-polyfill';

type IProps = BoxProps<'div'> & {
  text: string;
};

const CopyButton: React.FC<IProps> = ({ text, sx, ...props }) => {
  const onClickHandler = async () => {
    await navigator.clipboard.writeText(text);
    browser.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Address copied',
      message: 'Address was copied to your clipboard',
    });
  };
  return (
    <Box sx={{ cursor: 'pointer', ...sx }} onClick={onClickHandler} {...props}>
      <CopySvg />
    </Box>
  );
};

export default CopyButton;
