import { Link } from 'react-router-dom';
import logo from '../assets/logo/Logo.png';
import heroImg from '../assets/hero.png';

/* ─── tiny SVG icons ────────────────────────────────────────────────────── */
const Icon = ({ d, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ─── data ───────────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    title: 'Structured Curriculum',
    desc: 'Carefully sequenced modules that take you from fundamentals to advanced pre-litigation strategy.',
  },
  {
    icon: 'M15 10l4.553-2.069A1 1 0 0121 8.882V19a2 2 0 01-2 2H5a2 2 0 01-2-2V8.882a1 1 0 01.447-.951L8 10M12 2v8m0 0L8 6m4 4l4-4',
    title: 'Video-First Learning',
    desc: 'HD video lessons from seasoned legal professionals, watchable on any device at your own pace.',
  },
  {
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    title: 'Knowledge Quizzes',
    desc: 'Reinforce every lesson with targeted quizzes that identify gaps and track your mastery.',
  },
  {
    icon: 'M16 8v8m-4-5v5M8 8v8M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    title: 'Progress Tracking',
    desc: 'Visual dashboards show exactly where you are in each course and celebrate every milestone.',
  },
  {
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    title: 'Expert Instructors',
    desc: 'Learn directly from attorneys and paralegals with real-world pre-litigation experience.',
  },
  {
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    title: 'Certificates',
    desc: 'Earn recognised certificates upon course completion to advance your legal career.',
  },
];

const STEPS = [
  { number: '01', title: 'Create Your Account', desc: 'Sign up in seconds — no credit card required.' },
  { number: '02', title: 'Choose a Course', desc: 'Browse our growing library of pre-litigation courses.' },
  { number: '03', title: 'Learn & Practice', desc: 'Watch lessons, take quizzes, and track your progress.' },
  { number: '04', title: 'Earn Your Certificate', desc: 'Complete the course and download your certificate.' },
];

const STATS = [
  { value: '50+', label: 'Expert-led Courses' },
  { value: '2,000+', label: 'Students Enrolled' },
  { value: '95%', label: 'Completion Rate' },
  { value: '4.9★', label: 'Average Rating' },
];

const TESTIMONIALS = [
  {
    name: 'Sarah Mitchell',
    role: 'Paralegal, Houston TX',
    quote:
      'Pre-Litigation Academy gave me the confidence to handle demand letter drafting and client intake interviews on my own. The course structure is incredibly clear.',
    initials: 'SM',
  },
  {
    name: 'James Okonkwo',
    role: 'Law Graduate, Chicago IL',
    quote:
      'I passed my firm\'s competency assessment on the first try after completing the Evidence & Discovery module. The quizzes alone were worth it.',
    initials: 'JO',
  },
  {
    name: 'Maria Reyes',
    role: 'Legal Assistant, Miami FL',
    quote:
      'I love being able to watch lessons during my commute. The mobile experience is flawless and the instructors are genuinely experienced practitioners.',
    initials: 'MR',
  },
];

/* ─── sub-components ─────────────────────────────────────────────────────── */
function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#F0E8E5]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Pre-Litigation Academy" className="h-9 w-auto" />
          <span className="font-bold text-textDark text-sm hidden sm:block leading-tight">
            Pre-Litigation<br />
            <span className="text-secondary font-semibold">Academy</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <a href="#features" className="hover:text-secondary transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-secondary transition-colors">How it works</a>
          <a href="#testimonials" className="hover:text-secondary transition-colors">Testimonials</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium text-secondary hover:text-[#b37269] transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="text-sm font-medium bg-secondary text-white px-5 py-2.5 rounded-xl hover:bg-[#b37269] transition-colors shadow-sm"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 bg-background overflow-hidden">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Copy */}
        <div>
          <span className="inline-flex items-center gap-2 bg-accent/60 text-secondary text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
            Now enrolling — Spring 2026 cohort
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-textDark leading-[1.1] tracking-tight mb-6">
            Master Pre-Litigation{' '}
            <span className="text-secondary">Law Practice</span>{' '}
            from anywhere.
          </h1>

          <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-lg">
            Video-first courses, real-world case studies, and knowledge quizzes — built
            by practicing attorneys for the next generation of legal professionals.
          </p>

          <ul className="space-y-2 mb-10">
            {['Self-paced video lessons', 'Interactive quizzes & progress tracking', 'Industry-recognised certificates'].map(item => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                <span className="text-secondary shrink-0"><CheckIcon /></span>
                {item}
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 bg-secondary text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-[#b37269] transition-all shadow-md hover:shadow-lg text-base"
            >
              Start learning free
              <Icon d="M5 12h14M12 5l7 7-7 7" size={18} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#E8D0CC] text-textDark font-semibold px-8 py-3.5 rounded-xl hover:border-secondary hover:text-secondary transition-all text-base"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Hero image */}
        <div className="relative lg:flex hidden justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/40 to-primary/20 rounded-3xl blur-3xl" />
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#F0E8E5] w-full max-w-md">
            <img src={heroImg} alt="Learning interface" className="w-full h-72 object-cover" />
            {/* floating stat card */}
            <div className="absolute top-4 right-4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 border border-[#F0E8E5]">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-secondary">
                <Icon d="M13 10V3L4 14h7v7l9-11h-7z" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-400">Progress</p>
                <p className="text-sm font-bold text-textDark">72% complete</p>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary text-xs font-bold">01</div>
                <div>
                  <p className="text-xs text-gray-400">Current lesson</p>
                  <p className="text-sm font-semibold text-textDark">Demand Letter Essentials</p>
                </div>
              </div>
              <div className="w-full bg-[#F0E8E5] rounded-full h-2">
                <div className="bg-secondary rounded-full h-2" style={{ width: '72%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  return (
    <section className="bg-secondary py-12 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            <p className="text-sm text-white/70">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-secondary text-sm font-semibold uppercase tracking-widest">Why choose us</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-textDark mt-3 mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Our platform combines expert instruction, smart assessment, and a seamless
            learning experience — all in one place.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="group p-6 rounded-2xl border border-[#F0E8E5] hover:border-primary hover:shadow-md transition-all duration-200 bg-background"
            >
              <div className="w-12 h-12 bg-accent/60 group-hover:bg-accent rounded-2xl flex items-center justify-center text-secondary mb-4 transition-colors">
                <Icon d={icon} size={22} />
              </div>
              <h3 className="font-semibold text-textDark mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-secondary text-sm font-semibold uppercase tracking-widest">Simple process</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-textDark mt-3 mb-4">
            Up and learning in minutes
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map(({ number, title, desc }, i) => (
            <div key={number} className="relative flex flex-col items-center text-center">
              {/* connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-1/2 w-full h-px bg-[#E8D0CC]" />
              )}
              <div className="relative w-16 h-16 bg-white border-2 border-primary rounded-2xl flex items-center justify-center shadow-sm mb-4 z-10">
                <span className="text-lg font-bold text-secondary">{number}</span>
              </div>
              <h3 className="font-semibold text-textDark mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-secondary text-sm font-semibold uppercase tracking-widest">Student stories</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-textDark mt-3 mb-4">
            Trusted by legal professionals
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, role, quote, initials }) => (
            <div key={name} className="bg-background rounded-2xl p-6 border border-[#F0E8E5] flex flex-col">
              {/* stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#C6847A">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-5">"{quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-textDark">{name}</p>
                  <p className="text-xs text-gray-400">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center bg-secondary rounded-3xl px-8 py-16 relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl" />

        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 relative z-10">
          Ready to advance your legal career?
        </h2>
        <p className="text-white/80 mb-8 max-w-xl mx-auto relative z-10">
          Join thousands of students who have already transformed their careers
          through Pre-Litigation Academy.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 bg-white text-secondary font-bold px-8 py-3.5 rounded-xl hover:bg-accent transition-all shadow-md text-base"
          >
            Create free account
            <Icon d="M5 12h14M12 5l7 7-7 7" size={18} />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:border-white transition-all text-base"
          >
            Already a member? Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-textDark text-white/60 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-7 w-auto brightness-0 invert opacity-70" />
          <span className="text-white/40">Pre-Litigation Academy</span>
        </div>
        <p>© {new Date().getFullYear()} Pre-Litigation Academy. All rights reserved.</p>
        <div className="flex gap-6">
          <Link to="/login" className="hover:text-white transition-colors">Sign in</Link>
          <Link to="/signup" className="hover:text-white transition-colors">Sign up</Link>
        </div>
      </div>
    </footer>
  );
}

/* ─── page ───────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans">
      <Navbar />
      <Hero />
      <StatsBar />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
