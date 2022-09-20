import * as React from 'react';
import { Carousel } from 'react-responsive-carousel';
import AzukiPath from 'assets/img/azuki-banner.png';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import styles from './index.module.scss';
import Button from '@components/Button';

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
        <Button className={styles.buyNowBtn}>BUY NOW</Button>
      </div>
      <div>
        <img src={AzukiPath} />
      </div>
    </Carousel>
  );
};

export default CollectionCarousel;
