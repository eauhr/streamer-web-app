import React from 'react';

export default function PageHeader({ title, description, children }) {
  return (
    <div className="container-teev pb-8 pt-10 sm:pt-14">
      <h1 className="text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#A1A1AA]">{description}</p>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}