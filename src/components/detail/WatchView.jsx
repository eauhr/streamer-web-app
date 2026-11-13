import React, { useEffect, useMemo, useRef, useState } from 'react';
import { continueStore } from '@/lib/storage';
import { formatDuration } from '@/lib/tmdb';
import DetailHero from '@/components/detail/DetailHero';
import ActionRow from '@/components/detail/ActionRow';
import MetaBlock from '@/components/detail/MetaBlock';
import Availability from '@/components/detail/Availability';
import DetailTabs from '@/components/detail/DetailTabs';
import Player from '@/components/player/Player';
import ProviderSwitcher from '@/components/player/ProviderSwitcher';
import EpisodePicker from '@/components/player/EpisodePicker';

export default function WatchView({ item, autoPlay }) {
  const resume = useMemo(() => continueStore.get(item.mediaType, item.id), [item]);
  const isTv = item.mediaType === 'tv';
  const [playing, setPlaying] = useState(autoPlay);
  const [season, setSeason] = useState(resume?.season || 1);
  const [episode, setEpisode] = useState(resume?.episode || 1);
  const [startAt, setStartAt] = useState(resume?.watchedSeconds || 0);
  const playerRef = useRef(null);

  useEffect(() => {
    if (playing) playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [playing]);

  const choose = (s, e) => { setSeason(s); setEpisode(e); setStartAt(0); setPlaying(true); };
  const seasonOptions = item.seasonDetails?.length
    ? item.seasonDetails
    : (item.seasons || []).map((episodeCount, index) => ({ number: index + 1, episodeCount }));
  const currentSeasonIndex = seasonOptions.findIndex((option) => option.number === season);
  const currentSeason = seasonOptions[currentSeasonIndex];
  const next = () => {
    if (!isTv) return;
    if (episode < (currentSeason?.episodeCount || 0)) choose(season, episode + 1);
    else if (currentSeasonIndex >= 0 && seasonOptions[currentSeasonIndex + 1]) choose(seasonOptions[currentSeasonIndex + 1].number, 1);
  };

  const resumeNote = resume && resume.watchedSeconds > 30
    ? `Resume ${isTv ? `S${resume.season} E${resume.episode} · ` : ''}${formatDuration(resume.durationSeconds - resume.watchedSeconds)} left`
    : null;

  return (
    <div>
      <DetailHero item={item} />
      <div className="container-teev">
        <ActionRow item={item} onWatch={() => setPlaying(true)} resumeNote={resumeNote} />
        {playing && (
          <section ref={playerRef} aria-label="Player" className="mb-10 space-y-4">
            <Player item={item} season={season} episode={episode} startAt={startAt} autoplay onEnded={next} />
            <ProviderSwitcher />
            {isTv && (item.seasonDetails?.length || item.seasons?.length) > 0 && <EpisodePicker seasons={item.seasons} seasonDetails={item.seasonDetails} season={season} episode={episode} onChange={choose} />}
          </section>
        )}
        <MetaBlock item={item} />
        <Availability item={item} />
        <DetailTabs item={item} />
      </div>
    </div>
  );
}
