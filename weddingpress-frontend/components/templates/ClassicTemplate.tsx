"use client";

import { useState } from "react";
import { InvitationData } from "@/types/models";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/invitation/AudioPlayer";
import { GroomBrideSection } from "@/components/invitation/GroomBride";
import { EventsSection } from "@/components/invitation/Events";
import { StorySection } from "@/components/invitation/Story";
import { GallerySection } from "@/components/invitation/Gallery";
import { GiftSection } from "@/components/invitation/GiftSection";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";
import { RSVPForm } from "@/components/invitation/RSVPForm";
import { Guestbook } from "@/components/invitation/GuestBook";

export function ClassicTemplate({ data }: { data: InvitationData }) {
  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const { guest, wedding } = data;

  const handleOpenInvitation = () => {
    setIsCoverOpen(true);
  };

  // Gaya khusus Classic (Serif, Background Polos/Pattern)
  return (
    <div className="font-serif text-stone-800 bg-[#fdfbf7] min-h-screen">
      <AudioPlayer src={wedding.music_url} isPlaying={isCoverOpen} />

      {/* Konten Utama */}
      <AnimatePresence>
        {isCoverOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="max-w-4xl mx-auto border-x border-stone-200 bg-white min-h-screen shadow-xl"
          >
            {/* Header Dekoratif */}
            <div className="text-center py-12 bg-stone-50 border-b">
               <p className="tracking-[0.3em] text-xs uppercase text-stone-500 mb-4">The Wedding Celebration of</p>
               <h1 className="text-4xl text-stone-800" style={{ color: wedding.theme_color }}>
                 {wedding.groom_bride.groom_name} <span className="text-2xl italic">&</span> {wedding.groom_bride.bride_name}
               </h1>
            </div>

            <div className="p-4">
               <GroomBrideSection data={wedding.groom_bride} />
               <div className="my-8 border-t border-stone-200 w-1/2 mx-auto"></div>

               {wedding.show_events && <EventsSection data={wedding.events} />}
               <div className="my-8 border-t border-stone-200 w-1/2 mx-auto"></div>

               {wedding.show_story && <StorySection data={wedding.stories} />}
               {wedding.show_gallery && <GallerySection data={wedding.galleries} />}
               
               {wedding.show_gifts && wedding.gift_accounts && wedding.gift_accounts.length > 0 && (
                  <div className="bg-stone-50 p-8 rounded-lg border border-stone-200 mx-4 my-8">
                    <GiftSection accounts={wedding.gift_accounts} />
                  </div>
               )}

               <div className="px-4 pb-12">
                  <RSVPForm guest={guest} />
                  {wedding.show_guest_book && <Guestbook guestId={guest.id} weddingId={wedding.id} />}
               </div>
            </div>
            
            <footer className="text-center py-8 bg-stone-900 text-stone-400 text-sm">
                <p>WeddingPress &copy; {new Date().getFullYear()}</p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cover Classic */}
      <AnimatePresence>
        {!isCoverOpen && (
          <motion.div
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 bg-[#f5f5f0]"
          >
            <div className="max-w-lg w-full bg-white p-12 shadow-2xl text-center border double border-4 border-stone-200 outline outline-4 outline-offset-4 outline-white">
              <p className="text-stone-500 uppercase tracking-widest text-sm mb-6">Undangan Pernikahan</p>
              
              <div className="mb-8">
                 <h1 className="text-5xl mb-2 text-stone-900 font-serif">{wedding.groom_bride.groom_name}</h1>
                 <span className="text-2xl text-stone-400 italic">&</span>
                 <h1 className="text-5xl mt-2 text-stone-900 font-serif">{wedding.groom_bride.bride_name}</h1>
              </div>

              <div className="my-8 w-16 h-[1px] bg-stone-300 mx-auto"></div>

              <p className="text-stone-600 italic mb-2">Kepada Bapak/Ibu/Saudara/i:</p>
              <h3 className="text-xl font-bold text-stone-800 mb-8">{guest.name}</h3>
              
              <Button 
                onClick={handleOpenInvitation} 
                variant="outline"
                className="border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white transition-colors uppercase tracking-widest text-xs py-6 px-8"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Buka Undangan
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}