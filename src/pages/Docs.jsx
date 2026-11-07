import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import CodeBlock from '@/components/docs/CodeBlock';

const Section = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-24 space-y-4 border-t border-white/10 pt-10">
    <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
    <div className="space-y-4 text-[15px] leading-relaxed text-[#A1A1AA]">{children}</div>
  </section>
);

const PARAMS = [
  ['autoplay', 'true', 'Start playback automatically where the browser allows it.'],
  ['progress', 'seconds', 'Start time. Used by TeeV to resume from saved progress.'],
  ['nextEpisode', 'true', 'TV only. Continue to the next episode when one ends.'],
  ['color', 'hex (no #)', 'Accent color for the player controls.'],
];

export default function Docs() {
  return (
    <div>
      <PageHeader title="Developer docs" description="Everything you need to embed the player and understand how TeeV handles playback and catalog data." />
      <div className="container-teev max-w-4xl space-y-10">
        <Section id="quickstart" title="Quick start">
          <p>Drop an iframe on any page. Movies take a TMDB or IMDb ID; series also need a season and episode. Use the <Link to="/builder" className="text-white underline underline-offset-4">embed builder</Link> to generate one.</p>
          <CodeBlock code={'https://peachify.top/embed/movie/{TMDB_OR_IMDB_ID}\nhttps://peachify.top/embed/tv/{TMDB_OR_IMDB_ID}/{SEASON}/{EPISODE}'} />
        </Section>
        <Section id="params" title="Query parameters">
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#111111] text-white"><tr><th className="p-3 font-medium">Name</th><th className="p-3 font-medium">Value</th><th className="p-3 font-medium">Description</th></tr></thead>
              <tbody>{PARAMS.map(([n, v, d]) => <tr key={n} className="border-t border-white/10"><td className="p-3 font-mono text-white">{n}</td><td className="p-3">{v}</td><td className="p-3">{d}</td></tr>)}</tbody>
            </table>
          </div>
        </Section>
        <Section id="events" title="Player events">
          <p>The player posts messages to the parent window. TeeV listens for play, pause, time updates and completion, saving progress every 10 seconds, on pause and before the page unloads.</p>
          <CodeBlock code={`window.addEventListener('message', (e) => {\n  if (!e.origin.includes('peachify')) return;\n  const { event, currentTime, duration } = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;\n  // event: 'play' | 'pause' | 'timeupdate' | 'ended'\n});`} />
        </Section>
        <Section id="sources" title="Streaming sources">
          <p>TeeV can play the same title from several embed providers. On a title page, use the <strong className="text-white">Source</strong> switcher under the player to try another fetcher if one is unavailable — your choice is remembered on this device.</p>
          <ul className="list-disc space-y-1 pl-5">
            <li><strong className="text-white">Peachify</strong> — <code className="font-mono text-white">peachify.top/embed/movie/&#123;id&#125;</code> and <code className="font-mono text-white">peachify.top/embed/tv/&#123;id&#125;/&#123;s&#125;/&#123;e&#125;</code></li>
            <li><strong className="text-white">VidNest</strong> — <code className="font-mono text-white">vidnest.pro/movie/&#123;id&#125;</code> and <code className="font-mono text-white">vidnest.pro/tv/&#123;id&#125;/&#123;s&#125;/&#123;e&#125;</code></li>
            <li><strong className="text-white">VidCore</strong> — <code className="font-mono text-white">vidcore.io/movie/&#123;id&#125;</code> and <code className="font-mono text-white">vidcore.io/tv/&#123;id&#125;/&#123;s&#125;/&#123;e&#125;</code> (accepts IMDb or TMDB IDs)</li>
            <li><strong className="text-white">Embos</strong> — <code className="font-mono text-white">embos.top/movie/?mid=&#123;id&#125;</code> and <code className="font-mono text-white">embos.top/tv/?mid=&#123;id&#125;&s=&#123;s&#125;&e=&#123;e&#125;</code></li>
            <li><strong className="text-white">VidLink</strong> — <code className="font-mono text-white">vidlink.pro/movie/&#123;id&#125;</code> and <code className="font-mono text-white">vidlink.pro/tv/&#123;id&#125;/&#123;s&#125;/&#123;e&#125;</code> (custom colors, next-episode button, watch-progress events)</li>
          </ul>
        </Section>
        <Section id="env" title="Environment variables">
          <p>Copy <code className="font-mono text-white">.env.example</code> to <code className="font-mono text-white">.env.local</code> and set <code className="font-mono text-white">TMDB_API_READ_TOKEN</code>. TeeV proxies catalog requests through the Vite server so the token is not sent to the browser. Do not use a <code className="font-mono text-white">VITE_</code> prefix for the token.</p>
          <CodeBlock code={'TMDB_API_READ_TOKEN=YOUR_TMDB_V4_READ_TOKEN'} />
          <p>In local development, the Movies, Series and Search pages can browse paginated TMDB results. Without a token, TeeV uses its small built-in catalog. A production host needs an equivalent server-side <code className="font-mono text-white">/api/tmdb</code> proxy.</p>
        </Section>
        <Section id="credits" title="Credits">
          <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="inline-flex rounded bg-white px-3 py-2">
            <img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg" alt="The Movie Database (TMDB)" className="h-10 w-auto" />
          </a>
          <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
          <p>Streaming availability data, when enabled, is provided by JustWatch and must be attributed to JustWatch.</p>
        </Section>
        <Section id="storage" title="Local data">
          <p>Continue Watching is stored on the device under <code className="font-mono text-white">teev_continue_watching</code> and contains only metadata and playback position — never media files. My List and reactions are stored the same way.</p>
        </Section>
      </div>
    </div>
  );
}
