import { Paper, PaperProps } from '@mantine/core';

function VoyagePaper<C = 'div'>(props: PaperProps<C>) {
  const { children, sx, ...rest } = props;
  const styles = {
    ...sx,
    border: '0.5px solid',
    background: 'rgba(27, 29, 44, 0.6)',
    borderRadius: 10,
    borderImageSource:
      'linear-gradient(180deg, #575B79 0%, rgba(27, 29, 44, 0) 100%)',
  };
  return (
    <Paper {...rest} sx={styles}>
      {children}
    </Paper>
  );
}

export default VoyagePaper;
