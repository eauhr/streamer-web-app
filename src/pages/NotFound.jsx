import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/brand/Logo';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <section className="container-teev flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <Logo size="md" asLink={false} />
      <p className="mt-10 text-[7rem] font-extrabold leading-none tracking-[-0.06em] text-white sm:text-[10rem]">404</p>
      <h1 className="mt-4 text-xl font-semibold sm:text-2xl">That title is off the schedule.</h1>
      <p className="mt-2 max-w-md text-[#A1A1AA]">The page you’re looking for doesn’t exist or has moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">Go home</Link>
        <Link to="/movies" className="btn-ghost">Browse movies</Link>
      </div>
      <button type="button" onClick={() => navigate(-1)} className="mt-6 inline-flex items-center gap-1.5 text-sm text-[#A1A1AA] underline underline-offset-4 hover:text-white">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Go back
      </button>
    </section>
  );
}