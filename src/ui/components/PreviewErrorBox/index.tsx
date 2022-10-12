import Text from '@components/Text';
import { Box, BoxProps, Group } from '@mantine/core';
import { formatAmount, formatEthersBN } from '@utils/bn';
import { ReactComponent as DangerSvg } from 'assets/img/danger-triangle.svg';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { PreviewError, PreviewErrorType } from 'types/transaction';

type IProps = BoxProps<any> & {
  error: PreviewError;
};

const PreviewErrorBox: React.FunctionComponent<IProps> = ({
  error,
  ...props
}) => {
  const navigate = useNavigate();

  const errorText = () => {
    switch (error.type) {
      case PreviewErrorType.UNSUPPORTED_COLLECTION:
        return (
          <div>
            <strong>3x Leverage</strong> is not supported for this collection.
            <br />
            Click{' '}
            <Box
              component="span"
              sx={{ ':hover': { cursor: 'pointer' } }}
              onClick={() =>
                window.open(
                  'https://docs.voyage.finance/voyage/others/supported-collections',
                  '_blank'
                )
              }
            >
              <ins>
                <strong>here</strong>
              </ins>
            </Box>{' '}
            to learn more.
          </div>
        );
      case PreviewErrorType.FLOOR_PRICE:
        return (
          <div>
            <strong>
              The listed price of the selected NFT is higher than the floor
              price.
            </strong>
            <br />
            {error.metadata.floorPrice && (
              <>
                Current collection floor price is at{' '}
                <strong>
                  {formatAmount(formatEthersBN(error.metadata.floorPrice), 3)}{' '}
                  ETH
                </strong>
                .
              </>
            )}
          </div>
        );
      case PreviewErrorType.INSUFFICIENT_POOL:
        return (
          <div>
            <strong>There is insufficient liquidity in the pool.</strong>
            <br />
            Please try again later.
          </div>
        );
      case PreviewErrorType.UNSUPPORTED_CURRENCY:
        return (
          <div>
            <strong>This currency is currently not supported</strong>
          </div>
        );
      case PreviewErrorType.INSUFFICIENT_BALANCE:
        return (
          <div>
            <strong>Insufficient balance in wallet.</strong>
            <br />
            Please top up{' '}
            <Box
              component="span"
              sx={{ ':hover': { cursor: 'pointer' } }}
              onClick={() => navigate('/vault/topup/method')}
            >
              <ins>
                <strong>here</strong>
              </ins>
            </Box>
          </div>
        );
      default:
        return (
          <div>
            {error.message || 'Could not fetch information about this order'}
          </div>
        );
    }
  };
  return (
    <Group
      sx={{
        borderRadius: 10,
        background: 'rgba(255, 255, 255, 0.1)',
        minWidth: 98,
        border: '1px solid #FFA620',
      }}
      pl={23}
      pr={13}
      py={15}
      spacing={20}
      noWrap
      {...props}
    >
      <DangerSvg style={{ flexShrink: 0 }} />
      <Text size="sm">{errorText()}</Text>
    </Group>
  );
};

export default PreviewErrorBox;
