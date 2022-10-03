import { Box, BoxProps, LoadingOverlay } from '@mantine/core';
import { ChainID } from '@utils/constants';
import { config } from '@utils/env';
import { BrowserQRCodeSvgWriter } from '@zxing/browser';
import { useEffect } from 'react';

type IProps = BoxProps<'div'> & {
  address: string;
  isLoading?: boolean;
  size?: number;
};

const QrCode: React.FC<IProps> = ({
  address,
  isLoading = false,
  size = 125,
  ...props
}) => {
  const insertQrCode = (address: string) => {
    if (address) {
      const codeWriter = new BrowserQRCodeSvgWriter();
      let resultUri = `ethereum:${address}`;
      if (config.chainId === ChainID.Goerli) resultUri += `@${ChainID.Goerli}`;
      codeWriter.writeToDom('#result', resultUri, 300, 300);
    }
  };
  useEffect(() => {
    insertQrCode(address);
  }, [address]);
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 10,
        background: '#fff',
        position: 'relative',
      }}
      {...props}
    >
      <Box
        id="result"
        sx={{
          svg: {
            width: '100%',
            height: '100%',
          },
        }}
      ></Box>
      <LoadingOverlay visible={isLoading} />
    </Box>
  );
};

export default QrCode;
