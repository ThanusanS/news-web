import { NextSeo } from 'next-seo';
import Layout from '../components/Layout';
import Newsletter from '../components/Newsletter';
import { SITE_CONFIG, SOCIAL_LINKS } from '../utils/constants';
import { FiGlobe, FiCpu, FiCode, FiFileText, FiMail } from 'react-icons/fi';

const TEAM = [
  { name: 'Nimal Perera', role: 'Editor-in-Chief', bio: 'Senior journalist with 12 years covering Sri Lanka politics and economy.', icon: FiFileText },
  { name: 'Kasun Silva', role: 'Tech Editor', bio: 'Full-stack developer turned tech journalist. Passionate about AI and the future of work.', icon: FiCode },
  { name: 'Priya Mendis', role: 'AI & Programming Writer', bio: 'Machine learning engineer sharing practical AI tutorials for South Asian readers.', icon: FiCpu },
  { name: 'Ravi De Silva', role: 'World News Correspondent', bio: 'International affairs analyst with experience across South and Southeast Asia.', icon: FiGlobe },
];

export default function AboutPage() {
  return (
    <>
      <NextSeo
        title="About Us | CeylonUpdates.com"
        description="CeylonUpdates.com is Sri Lanka's fastest-growing news and tech platform. Learn about our team, mission, and content strategy."
        canonical="https://ceylonupdates.com/about"
      />
      <Layout>
        {/* Hero */}
        <div className="bg-gradient-to-br from-navy to-accent text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="font-head text-4xl md:text-5xl font-black mb-4">
              About CeylonUpdates.com
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
              Sri Lanka's fastest-growing news and tech platform, delivering reliable news,
              AI tutorials and programming guides to 100K+ readers across South Asia.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Mission */}
          <section className="mb-12">
            <h2 className="font-head text-2xl font-bold mb-4 text-stone-900 dark:text-neutral-50">Our Mission</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: FiGlobe, title: 'Represent Sri Lanka', text: 'Be the most trusted source for Sri Lanka news, covering stories that matter to our community both locally and in the diaspora.' },
                { icon: FiCpu, title: 'Democratize AI Knowledge', text: 'Make AI tools and tutorials accessible to everyone in South Asia — from students to professionals, in plain language that works.' },
                { icon: FiCode, title: 'Empower Developers', text: 'Build the best programming resource for Sri Lankan developers — practical guides, real projects, and career advice.' },
              ].map((m) => (
                <div key={m.title} className="bg-stone-50 dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-5">
                  <div className="mb-3 text-accent"><m.icon size={26} /></div>
                  <h3 className="font-head font-bold text-stone-900 dark:text-neutral-100 mb-2">{m.title}</h3>
                  <p className="text-sm text-stone-600 dark:text-neutral-400 leading-relaxed">{m.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Stats */}
          <section className="mb-12 bg-accent rounded-2xl p-8 text-white text-center">
            <h2 className="font-head text-2xl font-bold mb-6">By The Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { num: '100K+', label: 'Monthly Readers' },
                { num: '5/day', label: 'Articles Published' },
                { num: '6,840', label: 'Newsletter Subscribers' },
                { num: '#1', label: 'Sri Lanka Tech Blog' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-head text-3xl font-black">{s.num}</div>
                  <div className="text-white/70 text-sm mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Team */}
          <section className="mb-12">
            <h2 className="font-head text-2xl font-bold mb-6 text-stone-900 dark:text-neutral-50">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TEAM.map((member) => (
                <div key={member.name} className="flex gap-4 p-5 bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-orange-400 flex items-center justify-center text-xl shrink-0">
                    <member.icon size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-head font-bold text-stone-900 dark:text-neutral-100">{member.name}</h3>
                    <p className="text-xs font-semibold text-accent mb-1">{member.role}</p>
                    <p className="text-sm text-stone-500 dark:text-neutral-500 leading-relaxed">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Advertise */}
          <section className="mb-12 p-6 bg-stone-50 dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl">
            <h2 className="font-head text-xl font-bold mb-2 text-stone-900 dark:text-neutral-50">Advertise With Us</h2>
            <p className="text-stone-600 dark:text-neutral-400 text-sm mb-4">
              Reach 100,000+ monthly tech-savvy readers across Sri Lanka and South Asia.
              We offer banner ads, sponsored content, and newsletter sponsorships.
            </p>
            <a href="mailto:ads@ceylonupdates.com" className="btn-primary inline-flex">
              <FiMail size={16} className="mr-2" /> Contact Advertising Team →
            </a>
          </section>

          <Newsletter />
        </div>
      </Layout>
    </>
  );
}
