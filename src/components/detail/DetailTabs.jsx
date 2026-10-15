import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RelatedTab from '@/components/detail/RelatedTab';
import DetailsTab from '@/components/detail/DetailsTab';

const trigger = 'relative rounded-none bg-transparent px-0 pb-3 pt-0 text-base font-semibold text-[#A1A1AA] shadow-none transition hover:text-white data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-white after:opacity-0 data-[state=active]:after:opacity-100';

export default function DetailTabs({ item }) {
  return (
    <Tabs defaultValue="related">
      <TabsList className="h-auto w-full justify-start gap-8 rounded-none border-b border-white/10 bg-transparent p-0">
        <TabsTrigger value="related" className={trigger}>Related</TabsTrigger>
        <TabsTrigger value="details" className={trigger}>Details</TabsTrigger>
      </TabsList>
      <TabsContent value="related" className="mt-0"><RelatedTab item={item} /></TabsContent>
      <TabsContent value="details" className="mt-0"><DetailsTab item={item} /></TabsContent>
    </Tabs>
  );
}