import { Group } from '@mantine/core';
import Link from '@components/Link';
import { getShortenedAddress, getTxExpolerLink } from '@utils/env';

const NotificationBody: React.FC<{
  hash?: string;
}> = ({ hash }) => {
  return (
    <Group direction="column" spacing={0}>
      {hash && (
        <Link link={getTxExpolerLink(hash)} text={getShortenedAddress(hash)} />
      )}
    </Group>
  );
};

export default NotificationBody;
