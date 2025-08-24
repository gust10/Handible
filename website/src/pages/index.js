import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className={styles.heroBackground}>
        <div className={styles.floatingElements}>
          <div className={styles.floatingElement}></div>
          <div className={styles.floatingElement}></div>
          <div className={styles.floatingElement}></div>
          <div className={styles.floatingElement}></div>
          <div className={styles.floatingElement}></div>
        </div>
      </div>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.badgeContainer}>
            <span className={styles.badge}>🚀 Now in Beta</span>
            <span className={styles.badge}>✨ Open Source</span>
          </div>
          <Heading as="h1" className={clsx("hero__title", styles.modernTitle)}>
            The Future of 
            <span className={styles.gradientText}> Hand Control</span>
            <br />is Here
          </Heading>
          <p className={clsx("hero__subtitle", styles.modernSubtitle)}>
            Transform any webcam into a powerful 3D controller. Build immersive experiences with 
            <span className={styles.highlight}> gesture recognition</span>, 
            <span className={styles.highlight}> real-time tracking</span>, and 
            <span className={styles.highlight}> seamless Three.js integration</span>.
          </p>

          {/* Demo Section */}
          <div className={styles.heroDemoSection}>
            <div className={styles.demoGrid}>
              <div className={styles.demoCard}>
                <img src="static/img/demo_1.gif" alt="Hand Detection Demo" className={styles.heroGif} />
                <div className={styles.demoLabel}>👋 Hand Detection</div>
              </div>
              <div className={styles.demoCard}>
                <img src="static/img/demo_3.gif" alt="3D Object Control Demo" className={styles.heroGif} />
                <div className={styles.demoLabel}>🎯 3D Object Control</div>
              </div>
              <div className={styles.demoCard}>
                <img src="static/img/demo_2.gif" alt="Surface Interaction Demo" className={styles.heroGif} />
                <div className={styles.demoLabel}>🎨 Surface Interaction</div>
              </div>
            </div>
          </div>
          
          <div className={styles.statsContainer}>
            <div className={styles.stat}>
              <div className={styles.statNumber}>60fps</div>
              <div className={styles.statLabel}>Real-time</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>~16ms</div>
              <div className={styles.statLabel}>Latency</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>21</div>
              <div className={styles.statLabel}>Hand Points</div>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <Link
              className={clsx("button button--outline button--lg", styles.secondaryButton)}
              to="/docs/getting-started">
              <span>🚀 Get Started</span>
            </Link>
            <Link
              className={clsx("button button--lg", styles.demoButton)}
              to="/docs/intro">
              <span>⚡ Try Demo</span>
            </Link>
            <Link
              className={clsx("button button--outline button--lg", styles.secondaryButton)}
              to="/docs/api-reference">
              <span>📚 View Docs</span>
            </Link>
          </div>

          <div className={styles.quickCode}>
            <div className={styles.codeHeader}>
              <span>Quick Start</span>
              <button className={styles.copyButton}>📋 Copy</button>
            </div>
            <code className={styles.code}>
              npm install handible && import {`{ startGestureControl }`} from 'handible'
            </code>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="🔮 The Future of Hand Control"
      description="Revolutionary hand tracking and gesture control for the web. Build immersive 3D experiences with just a webcam.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}