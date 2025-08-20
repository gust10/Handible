import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Webcam-Based Interaction',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Control 3D environments using only a standard webcam. MetaHands leverages MediaPipe for seamless hand tracking, making it accessible without specialized hardware.
      </>
    ),
  },
  {
    title: 'Real-Time 3D Control',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Achieve smooth, real-time hand gesture recognition with up to 50 FPS using GPU acceleration. Interact with buttons, sliders, and chess pieces in virtual scenes.
      </>
    ),
  },
  {
    title: 'Modular and Extensible',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Built with a modular architecture, MetaHands supports custom gestures and scenes. Extend it easily via callback systems and integrate with your Three.js projects.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}