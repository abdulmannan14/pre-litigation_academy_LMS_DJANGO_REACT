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
    desc: 'Step-by-step modules that mirror real law firm workflows—from intake to settlement.',
  },
  {
    icon: 'M15 10l4.553-2.069A1 1 0 0121 8.882V19a2 2 0 01-2 2H5a2 2 0 01-2-2V8.882a1 1 0 01.447-.951L8 10M12 2v8m0 0L8 6m4 4l4-4',
    title: 'Video-First Learning',
    desc: 'Clear, practical lessons designed for beginners—no legal background required.',
  },
  {
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    title: 'Knowledge Quizzes',
    desc: 'Apply what you learn with scenario-based quizzes and exercises.',
  },
  {
    icon: 'M16 8v8m-4-5v5M8 8v8M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    title: 'Progress Tracking',
    desc: 'Track your growth and build confidence as you complete each stage.',
  },
  {
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    title: 'Attorney-Valued Skills',
    desc: 'Learn what real professionals value in pre-litigation positions. Attorney feedback coming soon.',
  },
  {
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    title: 'Certificates',
    desc: 'Receive a certificate of completion to showcase your skills to employers.',
  },
];

const STEPS = [
  { number: '01', title: 'Create Your Account', desc: 'Sign up in seconds—no experience required.' },
  { number: '02', title: 'Choose Your Course', desc: 'Start with foundational pre-litigation training.' },
  { number: '03', title: 'Learn & Practice', desc: 'Watch lessons, complete exercises, and build real skills.' },
  { number: '04', title: 'Earn Your Certificate', desc: 'Finish the course and showcase your completion certificate.' },
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

const JOBS = [
  {
    firm: 'Green & Martinez Legal Group',
    title: 'Pre-Litigation Paralegal',
    location: 'Houston, TX · On-site',
    description:
      'Support attorneys in managing personal injury pre-litigation cases — intake, evidence gathering, and demand letter preparation. Ideal for candidates with formal pre-litigation training.',
    applyUrl: '#',
  },
  {
    firm: 'Sunrise Injury Law',
    title: 'Case Manager – Pre-Litigation',
    location: 'Miami, FL · Hybrid',
    description:
      'Oversee pre-litigation case files from intake through settlement negotiation. Coordinate with clients, medical providers, and insurance adjusters on a daily basis.',
    applyUrl: '#',
  },
  {
    firm: 'North Star Law Offices',
    title: 'Legal Assistant – Personal Injury',
    location: 'Chicago, IL · Remote',
    description:
      'Assist with client communications, medical record requests, and chronology preparation in a high-volume personal injury practice.',
    applyUrl: '#',
  },
  {
    firm: 'Liberty Claims & Legal Services',
    title: 'Intake Specialist',
    location: 'Los Angeles, CA · On-site',
    description:
      'Handle new client intake calls and initial case assessments. Organize documentation and route cases to the appropriate legal team members.',
    applyUrl: '#',
  },
  {
    firm: 'Patterson & Webb Attorneys',
    title: 'Pre-Litigation Coordinator',
    location: 'Dallas, TX · Hybrid',
    description:
      'Coordinate all pre-litigation activities including scheduling, demand package assembly, and insurance correspondence for a busy litigation support team.',
    applyUrl: '#',
  },
  {
    firm: 'Justice Forward Law',
    title: 'Medical Records Analyst',
    location: 'Atlanta, GA · Remote',
    description:
      'Review and organize medical records, create chronologies, and prepare summaries to support demand packages and settlement negotiations.',
    applyUrl: '#',
  },
];

/* ─── sub-components ─────────────────────────────────────────────────────── */
function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#F0E8E5]">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="Pre-Litigation Academy"
            className=" w-auto drop-shadow-sm"
           style={{ 
            imageRendering: '-webkit-optimize-contrast',
            height: '7rem'
          }}
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <a href="#features" className="hover:text-secondary transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-secondary transition-colors">How it works</a>
          <a href="#testimonials" className="hover:text-secondary transition-colors">Testimonials</a>
          <a href="#careers" className="hover:text-secondary transition-colors">Careers</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium text-secondary hover:text-secondaryDark transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="text-sm font-medium bg-secondary text-white px-5 py-2.5 rounded-xl hover:bg-secondaryDark transition-colors shadow-sm"
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
    <section className="pt-24 pb-12 px-4 sm:pt-32 sm:pb-20 sm:px-6 bg-background overflow-hidden">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Copy */}
        <div>
          <span className="inline-flex items-center gap-2 bg-accent/60 text-secondary text-xs font-semibold px-3 py-1 rounded-full mb-4 sm:mb-6">
            <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
            Now enrolling — Spring 2026 cohort
          </span>

          <h1 className="text-[1.45rem] sm:text-4xl lg:text-[52px] font-bold text-textDark leading-[1.35] sm:leading-[1.15] tracking-normal sm:tracking-tight mb-4 sm:mb-6">
            Master Personal Injury Pre-Litigation{' '}
            <span className="text-secondary">Skills for Legal Careers</span>{' '}
            — from anywhere.
          </h1>

          <p className="text-gray-500 text-sm sm:text-lg leading-relaxed mb-5 sm:mb-8 max-w-lg">
            Step-by-step training in pre-litigation workflows designed for aspiring legal professionals and career changers.
          </p>

          <ul className="space-y-1.5 mb-6 sm:mb-10">
            {[
              'Learn real pre-litigation workflows used in law firms',
              'Practice demand letters, intake, and case handling',
              'Track progress with quizzes and real-world exercises',
              'Earn a certificate of completion',
            ].map(item => (
              <li key={item} className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-600">
                <span className="text-secondary shrink-0"><CheckIcon /></span>
                {item}
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 bg-secondary text-white font-semibold px-6 py-2.5 sm:px-8 sm:py-3.5 rounded-xl hover:bg-secondaryDark transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              Start learning free
              <Icon d="M5 12h14M12 5l7 7-7 7" size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#E8D0CC] text-textDark font-semibold px-6 py-2.5 sm:px-8 sm:py-3.5 rounded-xl hover:border-secondary hover:text-secondary transition-all text-sm sm:text-base"
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
    <section id="features" className="py-14 sm:py-24 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-secondary text-sm font-semibold uppercase tracking-widest">Why choose us</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-textDark mt-3 mb-4">
            Practical skills. Real workflows. Career-ready training.
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
    <section id="how-it-works" className="py-14 sm:py-24 px-4 sm:px-6 bg-background">
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
    <section id="testimonials" className="py-14 sm:py-24 px-4 sm:px-6 bg-white">
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
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#A55850">
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
        <p className="text-center text-xs text-gray-400 mt-8 max-w-xl mx-auto">
          Results may vary. This program provides training for legal support roles and does not constitute legal licensure.
        </p>
      </div>
    </section>
  );
}

function CareerOpportunities() {
  return (
    <section id="careers" className="py-14 sm:py-24 px-4 sm:px-6 bg-background">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-secondary text-sm font-semibold uppercase tracking-widest">Next steps</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-textDark mt-3 mb-4">
            Career Opportunities in Pre-Litigation
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            These are real opportunities to help you take the next step. Please review each role and apply directly.
          </p>
        </div>

        {/* Job cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {JOBS.map(({ firm, title, location, description, applyUrl }) => (
            <div
              key={`${firm}-${title}`}
              className="bg-white rounded-2xl border border-[#F0E8E5] p-6 flex flex-col gap-4 hover:shadow-md hover:border-primary transition-all duration-200"
            >
              {/* Firm + position */}
              <div>
                <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">{firm}</p>
                <h3 className="text-base font-bold text-textDark leading-snug">{title}</h3>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <svg className="w-3.5 h-3.5 shrink-0 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {location}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-500 leading-relaxed flex-1">{description}</p>

              {/* Skills note */}
              <div className="flex items-center gap-2 bg-accent/60 rounded-xl px-3 py-2">
                <svg className="w-4 h-4 text-secondary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-secondary font-medium">Skills from this course apply to this role</p>
              </div>

              {/* Apply button */}
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-secondary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-secondaryDark transition-colors"
              >
                Apply Now
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-gray-400 max-w-2xl mx-auto border-t border-[#F0E8E5] pt-8">
          We do not guarantee job placement. Opportunities are provided for informational purposes only.
          Pre-Litigation Academy is not affiliated with the listed firms and does not represent or endorse any employer.
        </p>
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
          Ready to start a career in the legal field?
        </h2>
        <p className="text-white/80 mb-8 max-w-xl mx-auto relative z-10">
          Learn in-demand pre-litigation skills used in real law offices.
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
      </div>
      <div className="max-w-6xl mx-auto px-6 pt-4 pb-2 border-t border-white/10 mt-4">
        <p className="text-xs text-white/30 text-center">
          Pre-Litigation Academy provides educational training only and does not offer legal advice or qualify individuals to practice law.
        </p>
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
      <CareerOpportunities />
      <CTA />
      <Footer />
    </div>
  );
}
