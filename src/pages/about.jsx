import { NextSeo } from 'next-seo';
import Layout from '../components/Layout';
import { FiGlobe, FiCpu, FiCode, FiFileText, FiMail } from 'react-icons/fi';

const TEAM = [
  {
    name: 'Nimal Perera',
    role: 'Editor-in-Chief',
    bio: 'Senior journalist with 12 years covering Sri Lanka politics and economy.',
    icon: FiFileText,
  },
  {
    name: 'Kasun Silva',
    role: 'Tech Editor',
    bio: 'Full-stack developer turned tech journalist. Passionate about AI and the future of work.',
    icon: FiCode,
  },
  {
    name: 'Priya Mendis',
    role: 'AI & Programming Writer',
    bio: 'Machine learning engineer sharing practical AI & Innovation insights for South Asian readers.',
    icon: FiCpu,
  },
  {
    name: 'Ravi De Silva',
    role: 'World News Correspondent',
    bio: 'International affairs analyst with experience across South and Southeast Asia.',
    icon: FiGlobe,
  },
];

export default function AboutPage() {
  return (
    <>
      <NextSeo
        title="About Us | CeylonUpdates.me"
        description="CeylonUpdates.me is Sri Lanka's fastest-growing news and tech platform. Learn about our team, mission, and content strategy."
        canonical="https://www.ceylonupdates.me/about"
      />
      <Layout>
        {/* Hero */}
        <div className="bg-gradient-to-br from-navy to-accent py-16 text-white">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h1 className="mb-4 font-head text-4xl font-black md:text-5xl">
              About CeylonUpdates.me
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/80">
              Sri Lanka's fastest-growing news and tech platform, delivering reliable news, AI &
              Innovation and programming guides for readers across South Asia.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-12">
          {/* Mission */}
          <section className="mb-12">
            <h2 className="mb-4 font-head text-2xl font-bold text-stone-900 dark:text-neutral-50">
              Our Mission
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                {
                  icon: FiGlobe,
                  title: 'Represent Sri Lanka',
                  text: 'Be the most trusted source for Sri Lanka news, covering stories that matter to our community both locally and in the diaspora.',
                },
                {
                  icon: FiCpu,
                  title: 'Democratize AI Knowledge',
                  text: 'Make AI & Innovation tools accessible to everyone in South Asia — from students to professionals, in plain language that works.',
                },
                {
                  icon: FiCode,
                  title: 'Empower Developers',
                  text: 'Build the best programming resource for Sri Lankan developers — practical guides, real projects, and career advice.',
                },
              ].map((m) => (
                <div
                  key={m.title}
                  className="rounded-xl border border-stone-200 bg-stone-50 p-5 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="mb-3 text-accent">
                    <m.icon size={26} />
                  </div>
                  <h3 className="mb-2 font-head font-bold text-stone-900 dark:text-neutral-100">
                    {m.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-stone-600 dark:text-neutral-400">
                    {m.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Highlights */}
          <section className="mb-12 rounded-2xl bg-accent p-8 text-center text-white">
            <h2 className="mb-6 font-head text-2xl font-bold">What We Focus On</h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {[
                { num: 'Daily', label: 'News Coverage' },
                { num: 'Practical', label: 'AI & Innovation' },
                { num: 'Actionable', label: 'Programming Guides' },
                { num: 'Regional', label: 'South Asia Focus' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-head text-3xl font-black">{s.num}</div>
                  <div className="mt-1 text-sm text-white/70">{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Team */}
          <section className="mb-12">
            <h2 className="mb-6 font-head text-2xl font-bold text-stone-900 dark:text-neutral-50">
              Our Team
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {TEAM.map((member) => (
                <div
                  key={member.name}
                  className="flex gap-4 rounded-xl border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-orange-400 text-xl">
                    <member.icon size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-head font-bold text-stone-900 dark:text-neutral-100">
                      {member.name}
                    </h3>
                    <p className="mb-1 text-xs font-semibold text-accent">{member.role}</p>
                    <p className="text-sm leading-relaxed text-stone-500 dark:text-neutral-500">
                      {member.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Advertise */}
          <section className="mb-12 rounded-xl border border-stone-200 bg-stone-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-2 font-head text-xl font-bold text-stone-900 dark:text-neutral-50">
              Advertise With Us
            </h2>
            <p className="mb-4 text-sm text-stone-600 dark:text-neutral-400">
              Reach engaged readers across Sri Lanka and South Asia. We offer banner ads, sponsored
              content, and newsletter sponsorships.
            </p>
            <a href="mailto:ads@ceylonupdates.me" className="btn-primary inline-flex">
              <FiMail size={16} className="mr-2" /> Contact Advertising Team →
            </a>
          </section>
        </div>
      </Layout>
    </>
  );
}
