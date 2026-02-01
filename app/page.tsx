import Link from "next/link";

export default function HomePage() {
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-container">
          <div className="landing-logo">
            <span className="landing-logo-icon">🚗</span>
            <span className="landing-logo-text">Automotive Grade Fuel</span>
          </div>
          <nav className="landing-nav">
            <Link href="#services" className="landing-nav-link">
              Services
            </Link>
            <Link href="#how-it-works" className="landing-nav-link">
              How It Works
            </Link>
            <Link href="#features" className="landing-nav-link">
              Features
            </Link>
            <Link href="/login" className="landing-cta-header">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-overlay" />
        <div className="landing-hero-content">
          <h1 className="landing-hero-title">Never Run Out of Fuel Again</h1>
          <p className="landing-hero-subtitle">
            Emergency fuel delivery, mechanic services, and EV charging assistance
            available 24/7 in remote and urban areas
          </p>
          <div className="landing-hero-buttons">
            <Link href="/signup" className="landing-btn landing-btn--primary">
              Request Service Now
            </Link>
            <Link href="#how-it-works" className="landing-btn landing-btn--secondary">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section id="services" className="landing-section landing-services">
        <div className="landing-container">
          <h2 className="landing-section-title">Our Services</h2>
          <p className="landing-section-subtitle">
            Comprehensive roadside assistance and fuel delivery services powered by
            real-time AI technology
          </p>
          <div className="landing-services-grid">
            <div className="landing-service-card">
              <div className="landing-service-icon">⛽</div>
              <h3 className="landing-service-title">Emergency Fuel Delivery</h3>
              <p className="landing-service-desc">
                Got fuel delivered to your location within minutes, even in remote
                forest areas and rural regions with limited fuel availability.
              </p>
            </div>
            <div className="landing-service-card">
              <div className="landing-service-icon">🔌</div>
              <h3 className="landing-service-title">EV Charging Assistance</h3>
              <p className="landing-service-desc">
                Mobile EV charging units available for electric vehicles stranded
                without power in any location.
              </p>
            </div>
            <div className="landing-service-card">
              <div className="landing-service-icon">🔧</div>
              <h3 className="landing-service-title">Mechanic Services</h3>
              <p className="landing-service-desc">
                Professional mechanics dispatched to your location for on-site vehicle
                repairs and maintenance.
              </p>
            </div>
            <div className="landing-service-card">
              <div className="landing-service-icon">⚡</div>
              <h3 className="landing-service-title">Electrical Repairs</h3>
              <p className="landing-service-desc">
                Expert electrical diagnostics and repairs for all vehicle electrical
                system issues.
              </p>
            </div>
            <div className="landing-service-card">
              <div className="landing-service-icon">🛞</div>
              <h3 className="landing-service-title">Puncture Repair</h3>
              <p className="landing-service-desc">
                Quick tire puncture repairs and replacements to get you back on the
                road safely.
              </p>
            </div>
            <div className="landing-service-card">
              <div className="landing-service-icon">📍</div>
              <h3 className="landing-service-title">Real-Time Tracking</h3>
              <p className="landing-service-desc">
                Track your service request and worker location in real-time with live
                GPS updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="landing-section landing-how-it-works">
        <div className="landing-container">
          <h2 className="landing-section-title">How It Works</h2>
          <p className="landing-section-subtitle">Get help in three simple steps</p>
          <div className="landing-steps">
            <div className="landing-step">
              <div className="landing-step-icon-wrapper">
                <div className="landing-step-icon">📱</div>
                <div className="landing-step-number">01</div>
              </div>
              <h3 className="landing-step-title">Request Service</h3>
              <p className="landing-step-desc">
                Open the app and select the service you need. Share your location and
                vehicle details instantly.
              </p>
            </div>
            <div className="landing-step">
              <div className="landing-step-icon-wrapper">
                <div className="landing-step-icon">🧭</div>
                <div className="landing-step-number">02</div>
              </div>
              <h3 className="landing-step-title">Worker Assigned</h3>
              <p className="landing-step-desc">
                Our system automatically assigns the nearest available worker to your
                request with real-time tracking.
              </p>
            </div>
            <div className="landing-step">
              <div className="landing-step-icon-wrapper">
                <div className="landing-step-icon">✅</div>
                <div className="landing-step-number">03</div>
              </div>
              <h3 className="landing-step-title">Service Delivered</h3>
              <p className="landing-step-desc">
                Receive professional service at your location with transparent updates
                throughout the process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Technology Section */}
      <section id="features" className="landing-section landing-technology">
        <div className="landing-container landing-technology-container">
          <div className="landing-technology-content">
            <h2 className="landing-technology-title">
              Advanced Technology for Reliable Service
            </h2>
            <p className="landing-technology-desc">
              Our cloud-based platform uses IoT sensors and real-time data to ensure
              you never get stranded.
            </p>
            <div className="landing-features">
              <div className="landing-feature">
                <span className="landing-feature-icon">☁️</span>
                <div>
                  <h4 className="landing-feature-title">Cloud Technology</h4>
                  <p className="landing-feature-desc">
                    Real-time updates on fuel availability and service worker locations
                    across all stations.
                  </p>
                </div>
              </div>
              <div className="landing-feature">
                <span className="landing-feature-icon">📡</span>
                <div>
                  <h4 className="landing-feature-title">IoT Monitoring</h4>
                  <p className="landing-feature-desc">
                    Monitor and predict fuel stock levels at remote and urban stations
                    using advanced sensors.
                  </p>
                </div>
              </div>
              <div className="landing-feature">
                <span className="landing-feature-icon">🔄</span>
                <div>
                  <h4 className="landing-feature-title">Transparent Updates</h4>
                  <p className="landing-feature-desc">
                    Get instant notifications and transparent real-time updates on your
                    service request status.
                  </p>
                </div>
              </div>
              <div className="landing-feature">
                <span className="landing-feature-icon">👤</span>
                <div>
                  <h4 className="landing-feature-title">User-Friendly Interface</h4>
                  <p className="landing-feature-desc">
                    Intuitive design makes requesting services quick and easy for
                    everyone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="landing-technology-visual">
            <div className="landing-phone-mockup">
              <div className="landing-phone-screen"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Get Started Section */}
      <section className="landing-section landing-cta-section">
        <div className="landing-container">
          <h2 className="landing-cta-title">Ready to Get Started?</h2>
          <p className="landing-cta-subtitle">
            Join thousands of drivers who trust Automotive Grace Fuel for emergency
            roadside assistance
          </p>
          <Link href="/signup" className="landing-cta-button">
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer-container">
          <div className="landing-footer-brand">
            <div className="landing-footer-logo">
              <span className="landing-footer-logo-icon">🚗</span>
              <span className="landing-footer-logo-text">AGF</span>
            </div>
            <p className="landing-footer-desc">
              Emergency fuel delivery and roadside assistance available 24/7
            </p>
            <p className="landing-footer-copyright">
              © 2020 Automotive Grace Fuel. All rights reserved.
            </p>
          </div>
          <div className="landing-footer-links">
            <div className="landing-footer-column">
              <h4 className="landing-footer-heading">Services</h4>
              <Link href="#" className="landing-footer-link">
                Fuel Delivery
              </Link>
              <Link href="#" className="landing-footer-link">
                EV Charging
              </Link>
              <Link href="#" className="landing-footer-link">
                Mechanic Services
              </Link>
              <Link href="#" className="landing-footer-link">
                Electrical Repairs
              </Link>
            </div>
            <div className="landing-footer-column">
              <h4 className="landing-footer-heading">Company</h4>
              <Link href="#" className="landing-footer-link">
                About Us
              </Link>
              <Link href="#" className="landing-footer-link">
                Careers
              </Link>
              <Link href="#" className="landing-footer-link">
                Contact
              </Link>
              <Link href="#" className="landing-footer-link">
                Support
              </Link>
            </div>
          </div>
          <div className="landing-footer-social">
            <h4 className="landing-footer-heading">Connect</h4>
            <div className="landing-social-icons">
              <a href="#" className="landing-social-icon" aria-label="Facebook">
                📘
              </a>
              <a href="#" className="landing-social-icon" aria-label="Twitter">
                🐦
              </a>
              <a href="#" className="landing-social-icon" aria-label="Instagram">
                📷
              </a>
            </div>
            <a href="mailto:AGF@gmail.com" className="landing-footer-chat">
              💬 Talk with us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
