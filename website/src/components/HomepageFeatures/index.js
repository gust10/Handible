import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: '🎥 Webcam-Based Magic',
    icon: '🎯',
    description: (
      <>
        Transform any standard webcam into a powerful 3D controller. Handible leverages cutting-edge MediaPipe technology for seamless hand tracking - no specialized hardware required.
      </>
    ),
    gradient: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
  },
  {
    title: '⚡ Real-Time Performance',
    icon: '🚀',
    description: (
      <>
        Experience buttery-smooth 60fps hand gesture recognition with GPU acceleration. Interact with buttons, sliders, and 3D objects with zero latency for truly immersive experiences.
      </>
    ),
    gradient: 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    title: '🔧 Modular & Extensible',
    icon: '⚙️',
    description: (
      <>
        Built with modern architecture, Handible seamlessly integrates with Three.js projects. Customize gestures, extend functionality, and create unique interactive experiences.
      </>
    ),
    gradient: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
  },
];

function Feature({icon, title, description, gradient}) {
  return (
    <div className={clsx('col col--4', styles.featureCard)}>
      <div className={styles.cardContent} style={{ background: gradient }}>
        <div className={styles.iconContainer}>
          <div className={styles.featureIcon}>{icon}</div>
        </div>
        <div className={styles.cardBody}>
          <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
          <p className={styles.featureDescription}>{description}</p>
        </div>
        <div className={styles.cardGlow}></div>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            🌟 Why Choose <span className={styles.loveText}>Handible</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            Powerful features that make hand tracking accessible and effortless
          </p>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
        
        <div className={styles.techStack}>
          <h3 className={styles.techTitle}>🛠️ Built with Modern Tech</h3>
          <div className={styles.techBadges}>
            <span className={styles.techBadge}>JavaScript</span>
            <span className={styles.techBadge}>Three.js</span>
            <span className={styles.techBadge}>MediaPipe</span>
            <span className={styles.techBadge}>WebGL</span>
          </div>
        </div>
      </div>
    </section>
  );
}