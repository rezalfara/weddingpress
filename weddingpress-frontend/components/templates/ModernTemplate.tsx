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
import { Mail } from "lucide-react";
import { RSVPForm } from "@/components/invitation/RSVPForm";
import { Guestbook } from "@/components/invitation/GuestBook";

export function ModernTemplate({ data }: { data: InvitationData }) {
  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const { guest, wedding } = data;

  const handleOpenInvitation = () => {
    setIsCoverOpen(true);
  };

  return (
    <div className="font-sans text-slate-800 bg-white min-h-screen">
      <AudioPlayer src={wedding.music_url} isPlaying={isCoverOpen} />

      <AnimatePresence>
        {isCoverOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            <GroomBrideSection data={wedding.groom_bride} />

            {wedding.show_events && <EventsSection data={wedding.events} />}
            {wedding.show_story && <StorySection data={wedding.stories} />}
            {wedding.show_gallery && <GallerySection data={wedding.galleries} />}
            {wedding.show_gifts && wedding.gift_accounts && wedding.gift_accounts.length > 0 && (
              <GiftSection accounts={wedding.gift_accounts} />
            )}
            
            <RSVPForm guest={guest} />
            
            {wedding.show_guest_book && (
              <Guestbook guestId={guest.id} weddingId={wedding.id} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cover Modern */}
      <AnimatePresence>
        {!isCoverOpen && (
          <motion.div
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 1.0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center p-8"
            style={{
              backgroundImage: `url(${wedding.cover_image_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
            
            <div className="relative z-10 text-white space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-wider uppercase">
                The Wedding Of
              </h1>
              <div className="h-1 w-24 bg-white mx-auto my-4"></div>
              <h2 className="text-3xl md:text-5xl font-light font-serif mt-2">
                 {wedding.groom_bride.groom_name} & {wedding.groom_bride.bride_name}
              </h2>
              
              <div className="pt-8">
                <p className="mb-2">Kepada Yth.</p>
                <div className="text-xl font-bold bg-white/20 px-6 py-2 rounded-full inline-block backdrop-blur-sm">
                    {guest.name}
                </div>
                {guest.group && <p className="mt-1 text-sm text-gray-300">({guest.group})</p>}
              </div>

              <Button 
                onClick={handleOpenInvitation} 
                className="mt-12 rounded-full px-8 py-6 text-lg shadow-lg hover:scale-105 transition-transform" 
                style={{ backgroundColor: wedding.theme_color || "#000", color: "#fff" }}
              >
                <Mail className="mr-2 h-5 w-5" />
                Buka Undangan
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}