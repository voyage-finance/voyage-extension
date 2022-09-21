import * as React from 'react';
import { Carousel } from 'react-responsive-carousel';
import AzukiPath from 'assets/img/azuki-banner.png';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import styles from './index.module.scss';
import Button from '@components/Button';

const AZUKI_LINK =
  'https://looksrare.org/ru/collections/0xED5AF388653567Af2F388E6224dC7C4b3241C544?queryID=877e188f0fdf7c930f6d817d66d32d1d';

const CollectionCarousel: React.FunctionComponent = () => {
  return (
    <Carousel
      showArrows={false}
      showStatus={false}
      swipeable
      showThumbs={false}
    >
      <div style={{ position: 'relative' }}>
        <img src={AzukiPath} />
        <Button
          className={styles.buyNowBtn}
          onClick={() => window.open(AZUKI_LINK, '_blank')}
        >
          BUY NOW
        </Button>
      </div>
      <div>
        <img src={AzukiPath} />
      </div>
    </Carousel>
  );
};

export default CollectionCarousel;
