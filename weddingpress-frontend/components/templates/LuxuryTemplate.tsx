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
import { RSVPForm } from "@/components/invitation/RSVPForm";
import { Guestbook } from "@/components/invitation/GuestBook";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star } from "lucide-react";

export function LuxuryTemplate({ data }: { data: InvitationData }) {
  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const { guest, wedding } = data;

  // Helper untuk gradasi emas
  const goldText = "bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent";
  const goldBorder = "border border-[#BF953F]";

  return (
    <div className="font-sans text-slate-200 bg-[#0F172A] min-h-screen">
      <AudioPlayer src={wedding.music_url} isPlaying={isCoverOpen} />

      <AnimatePresence>
        {isCoverOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="max-w-3xl mx-auto bg-[#1e293b] min-h-screen shadow-[0_0_50px_rgba(191,149,63,0.1)] border-x border-[#BF953F]/30"
          >
            {/* Header Mewah */}
            <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                 <div className="absolute inset-0 bg-black/60 z-10"></div>
                 {/* Background Image jika ada, atau pattern */}
                 <div 
                    className="absolute inset-0 bg-cover bg-center grayscale opacity-40"
                    style={{ backgroundImage: `url(${wedding.cover_image_url})` }}
                 ></div>
                 
                 <div className="relative z-20 text-center border-4 border-double border-[#BF953F] p-10 m-4 bg-black/40 backdrop-blur-sm">
                    <h2 className="text-sm uppercase tracking-[0.4em] text-[#FCF6BA] mb-4">The Wedding Of</h2>
                    <h1 className={`text-5xl md:text-7xl font-serif font-bold ${goldText} drop-shadow-lg`}>
                        {wedding.groom_bride.groom_name} <br/> & <br/> {wedding.groom_bride.bride_name}
                    </h1>
                 </div>
            </div>

            <div className="p-8 space-y-16">
                {/* Konten dengan style dark mode */}
                <div className="text-center space-y-4">
                   <Sparkles className="mx-auto text-[#BF953F] w-8 h-8 animate-pulse" />
                   <p className="text-slate-300 italic font-light">"Together with our families, we request the honor of your presence."</p>
                </div>

                {/* Modifikasi komponen agar cocok di dark mode: Biasanya komponen bawaan transparan/ikut parent, tapi jika ada bg-white hardcoded di komponen asli, perlu override css atau wrap di div */}
                <div className="[&_h3]:text-[#FCF6BA] [&_p]:text-slate-300">
                   <GroomBrideSection data={wedding.groom_bride} />
                </div>

                {wedding.show_events && (
                    <div className={`p-8 rounded-xl bg-[#0F172A] ${goldBorder} text-center relative overflow-hidden`}>
                         <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#BF953F] blur-[100px] opacity-20"></div>
                         <div className="relative z-10 [&_h3]:text-[#FCF6BA] [&_p]:text-slate-300 [&_div]:text-slate-300">
                            <EventsSection data={wedding.events} />
                         </div>
                    </div>
                )}

                {wedding.show_story && (
                    <div className="[&_h3]:text-[#FCF6BA] [&_p]:text-slate-300 [&_span]:text-slate-400">
                        <StorySection data={wedding.stories} />
                    </div>
                )}
                
                {wedding.show_gallery && <GallerySection data={wedding.galleries} />}
                
                {wedding.show_gifts && wedding.gift_accounts?.length > 0 && (
                     <div className="bg-[#0F172A] p-8 rounded-xl border border-[#BF953F]/50 [&_p]:text-slate-300 [&_h3]:text-[#FCF6BA]">
                        <GiftSection accounts={wedding.gift_accounts} />
                     </div>
                )}

                {/* RSVP & Guestbook area */}
                <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
                     {/* Note: Form Input text mungkin perlu class text-black jika component aslinya transparan */}
                     <div className="[&_label]:text-[#FCF6BA] [&_input]:bg-slate-700 [&_input]:text-white [&_textarea]:bg-slate-700 [&_textarea]:text-white">
                        <RSVPForm guest={guest} />
                     </div>
                     
                     {wedding.show_guest_book && (
                        <div className="mt-8 [&_h3]:text-[#FCF6BA] [&_p]:text-slate-300">
                           <Guestbook guestId={guest.id} weddingId={wedding.id} />
                        </div>
                     )}
                </div>
            </div>

             <footer className="py-10 text-center border-t border-[#BF953F]/30 bg-[#0F172A]">
                 <p className={`text-2xl font-serif ${goldText}`}>{wedding.groom_bride.groom_name} & {wedding.groom_bride.bride_name}</p>
             </footer>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Cover Luxury */}
      <AnimatePresence>
        {!isCoverOpen && (
          <motion.div
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 1.0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#050505]"
          >
             {/* Background Image Blur */}
             <div 
                className="absolute inset-0 bg-cover bg-center opacity-20 scale-110"
                style={{ backgroundImage: `url(${wedding.cover_image_url})` }}
             ></div>

             <div className={`relative z-10 max-w-md w-full p-[2px] bg-gradient-to-br from-[#BF953F] via-[#FCF6BA] to-[#B38728] rounded-lg`}>
                <div className="bg-[#0F172A] p-10 text-center rounded-lg h-full flex flex-col items-center justify-center gap-6">
                    <Star className="text-[#BF953F] w-6 h-6 mb-2" />
                    
                    <p className="text-[#bf953f] tracking-[0.3em] text-xs uppercase">Royal Wedding Invitation</p>
                    
                    <div className="space-y-2">
                        <h1 className={`text-5xl font-serif ${goldText}`}>{wedding.groom_bride.groom_name}</h1>
                        <p className="text-slate-400 text-2xl font-serif">&</p>
                        <h1 className={`text-5xl font-serif ${goldText}`}>{wedding.groom_bride.bride_name}</h1>
                    </div>

                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#BF953F] to-transparent my-4"></div>

                    <div className="text-slate-300">
                        <p className="text-xs mb-2 opacity-70">Dear Honored Guest:</p>
                        <h3 className="text-2xl font-semibold text-white">{guest.name}</h3>
                        {guest.group && <p className="text-sm text-[#BF953F] mt-1">{guest.group}</p>}
                    </div>

                    <Button 
                        onClick={() => setIsCoverOpen(true)}
                        className="mt-6 bg-gradient-to-r from-[#BF953F] to-[#B38728] text-black font-bold px-10 py-6 rounded-sm hover:brightness-110 transition-all"
                    >
                        OPEN INVITATION
                    </Button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}