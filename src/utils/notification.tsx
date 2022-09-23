import {
  showNotification as showMantineNotification,
  NotificationProps,
} from '@mantine/notifications';
import NotificationBody from '@components/moleculas/NotificationBody';

type IProps = NotificationProps & {
  type: 'success' | 'info' | 'error';
  hash?: string;
};

export const showNotification = ({ hash, ...props }: IProps) => {
  showMantineNotification({
    ...props,
    message: <NotificationBody hash={hash} />,
    styles: (theme) => ({
      icon: {
        backgroundColor: 'unset !important',
        '.redStroke': {
          path: {
            stroke: 'red',
          },
        },
        marginRight: 7,
        marginTop: -2,
      },
      root: {
        backgroundColor: '#242940',
        borderRadius: 5,
        borderWidth: 0,
        boxShadow: '0px 0px 16px rgba(0, 0, 0, 0.5)',
        alignItems: 'start',
        padding: '16px 14px',
        position: 'relative',
      },
      title: {
        color: theme.white,
        fontSize: 16,
        fontWeight: 700,
      },
    }),
  });
};

export default showNotification;
