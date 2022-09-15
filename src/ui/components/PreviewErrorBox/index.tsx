import Text from '@components/Text';
import { BoxProps, Group } from '@mantine/core';
import { formatAmount, formatEthersBN } from '@utils/bn';
import { ReactComponent as DangerSvg } from 'assets/img/danger-triangle.svg';
import * as React from 'react';
import { PreviewError, PreviewErrorType } from 'types/transaction';

type IProps = BoxProps<any> & {
  error: PreviewError;
};

const PreviewErrorBox: React.FunctionComponent<IProps> = ({
  error,
  ...props
}) => {
  const errorText = () => {
    switch (error.type) {
      case PreviewErrorType.UNSUPPORTED_COLLECTION:
        return (
          <div>
            BNPL is not supported for this collection.
            <br />
            Click{' '}
            <Text inherit variant="link" component="a" href="voyage.finance">
              here
            </Text>{' '}
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
            <strong>This currency is currently not support by BNPL</strong>
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
      px={23}
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
