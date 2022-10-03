import { Group } from '@mantine/core';
import Link from '@components/Link';
import { getShortenedAddress, getTxExplorerLink } from '@utils/env';

const NotificationBody: React.FC<{
  hash?: string;
}> = ({ hash }) => {
  return (
    <Group direction="column" spacing={0}>
      {hash && (
        <Link link={getTxExplorerLink(hash)} text={getShortenedAddress(hash)} />
      )}
    </Group>
  );
};

export default NotificationBody;
