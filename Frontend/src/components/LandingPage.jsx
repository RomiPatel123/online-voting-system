import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Vote,
  Users,
  BarChart3,
  ChevronRight,
  Lock,
  CheckCircle2,
  ArrowRight,
  Zap,
  Globe,
} from 'lucide-react';
import './landing.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="lp">

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          {/* Brand */}
          <div className="lp-brand" onClick={() => navigate('/')}>
            <div className="lp-brand-icon">
              <Vote size={20} />
            </div>
            <span className="lp-brand-name">Samashti</span>
          </div>

          {/* Desktop links */}
          <div className="lp-nav-links">
            <a href="#features" className="lp-nav-link">Features</a>
            <a href="#how-it-works" className="lp-nav-link">How it Works</a>
          </div>

          {/* Actions */}
          <div className="lp-nav-actions">
            <button className="lp-btn-ghost" onClick={() => navigate('/login')}>
              Voter Login
            </button>
            <button className="lp-btn-cta" onClick={() => navigate('/register')}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero-blob-1" />
        <div className="lp-hero-blob-2" />
        <div className="lp-hero-blob-3" />

        <div className="lp-hero-inner">
          {/* Badge */}
          <div className="lp-hero-badge">
            <span className="lp-hero-badge-dot" />
            Next-Generation Council Voting Platform
          </div>

          {/* Headline */}
          <h1 className="lp-hero-title">
            Empowering <span className="lp-hero-title-accent">Study Hallians:</span><br/>
            Secure &amp; Transparent Council Elections
          </h1>

          {/* Subtext */}
          <p className="lp-hero-subtitle">
            Lucknow's premier student election infrastructure for Study Hall College. 
            Built on top-tier security standards to ensure every voice counts in our community.
          </p>

          {/* Login buttons */}
          <div className="lp-hero-btns">
            <button
              className="lp-login-btn lp-login-btn-voter"
              onClick={() => navigate('/login')}
            >
              <Users size={18} />
              Voter Login
              <ChevronRight size={16} />
            </button>

            <button
              className="lp-login-btn lp-login-btn-candidate"
              onClick={() => navigate('/candidate-login')}
            >
              <Vote size={18} />
              Candidate Login
              <ChevronRight size={16} />
            </button>

            <button
              className="lp-login-btn lp-login-btn-admin"
              onClick={() => navigate('/admin-login')}
            >
              <Lock size={18} />
              Admin Login
              <Lock size={14} style={{ opacity: 0.5 }} />
            </button>

            <button
              className="lp-login-btn lp-login-btn-register"
              onClick={() => navigate('/register')}
            >
              Register Now
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Trust strip */}
          <div className="lp-trust-strip">
            <span className="lp-trust-label">Trusted by</span>
            <div className="lp-trust-item">
              <ShieldCheck size={16} /> GovTech
            </div>
            <div className="lp-trust-item">
              <Lock size={16} /> SecureCorp
            </div>
            <div className="lp-trust-item">
              <Globe size={16} /> EduVote
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section id="features" className="lp-features">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <div className="lp-section-tag">Why Samashti @ Study Hall</div>
            <h2 className="lp-section-title">Built for Integrity, Designed for Students</h2>
            <p className="lp-section-subtitle">
              We've re-imagined the democratic process for Study Hall College Lucknow —
              guaranteeing security, accessibility, and absolute transparency in council representation.
            </p>
          </div>

          <div className="lp-features-grid">
            {/* Feature 1 */}
            <div className="lp-feature-card lp-feature-card-blue">
              <div className="lp-feature-icon lp-feature-icon-blue">
                <ShieldCheck size={26} />
              </div>
              <div className="lp-feature-title">Military-Grade Security</div>
              <p className="lp-feature-text">
                Protected by advanced encryption algorithms and ID-based
                verification ensuring 100% voter authenticity.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="lp-feature-card lp-feature-card-purple">
              <div className="lp-feature-icon lp-feature-icon-purple">
                <CheckCircle2 size={26} />
              </div>
              <div className="lp-feature-title">Tamper-Proof Results</div>
              <p className="lp-feature-text">
                Once a vote is cast, it's immutable. Cryptographic signatures
                ensure that no record can be altered or deleted.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="lp-feature-card lp-feature-card-green">
              <div className="lp-feature-icon lp-feature-icon-green">
                <BarChart3 size={26} />
              </div>
              <div className="lp-feature-title">Real-Time Analytics</div>
              <p className="lp-feature-text">
                Monitor election statistics in real-time. Comprehensive
                dashboards provide complete visibility without compromising
                anonymity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────── */}
      <section id="how-it-works" className="lp-how">
        <div className="lp-how-blob-1" />
        <div className="lp-how-blob-2" />

        <div className="lp-section-inner">
          <div className="lp-section-header">
            <div className="lp-section-tag">Direct Democracy</div>
            <h2 className="lp-section-title">Fast. Simple. Verifiable.</h2>
            <p className="lp-section-subtitle">
              Participating in Study Hall's student leadership has never been easier.
              Just follow these three intuitive steps.
            </p>
          </div>

          <div className="lp-steps-grid">
            <div className="lp-step">
              <div className="lp-step-circle">
                <span className="lp-step-num lp-step-num-1">1</span>
              </div>
              <div className="lp-step-title">Register &amp; Verify</div>
              <p className="lp-step-text">
                Sign up securely and verify your identity using your ID
                card details.
              </p>
            </div>

            <div className="lp-step">
              <div className="lp-step-circle">
                <span className="lp-step-num lp-step-num-2">2</span>
              </div>
              <div className="lp-step-title">Review Candidates</div>
              <p className="lp-step-text">
                Browse candidate profiles, party symbols, and manifestos to
                make an informed decision.
              </p>
            </div>

            <div className="lp-step">
              <div className="lp-step-circle">
                <span className="lp-step-num lp-step-num-3">3</span>
              </div>
              <div className="lp-step-title">Cast Your Vote</div>
              <p className="lp-step-text">
                Submit your vote with a single click. Receive confirmation
                that your voice was counted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="lp-cta">
        <div className="lp-cta-inner">
          <h2 className="lp-cta-title">
            Ready to experience the future of voting?
          </h2>
          <p className="lp-cta-subtitle">
            Join thousands of Study Hallians who have already upgraded their 
            democratic infrastructure with Samashti.
          </p>
          <button className="lp-cta-btn" onClick={() => navigate('/register')}>
            <Zap size={18} />
            Create an Account Now
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-grid">
          {/* Brand col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="lp-brand-icon" style={{ width: 32, height: 32 }}>
                <Vote size={16} />
              </div>
              <span className="lp-footer-brand-name">Samashti</span>
            </div>
            <p className="lp-footer-desc">
              Lucknow's premier student voting platform ensuring security, transparency,
              and accessibility for Study Hall College council elections.
            </p>
          </div>

          {/* Product links */}
          <div>
            <div className="lp-footer-col-title">Product</div>
            <ul className="lp-footer-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How it Works</a></li>
              <li><a href="#">Security</a></li>
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <div className="lp-footer-col-title">Legal</div>
            <ul className="lp-footer-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="lp-footer-bottom">
          <span>© {new Date().getFullYear()} Samashti. All rights reserved.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            Made with <Lock size={12} /> for secure elections
          </span>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
