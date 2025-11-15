"use client";

import { useState } from "react";
import { InvitationData } from "@/types/models";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/invitation/AudioPlayer";
import { GroomBrideSection } from "@/components/invitation/GroomBride";
import { EventsSection } from "@/components/invitation/Events";
import { StorySection } from "@/components/invitation/Story";
import { GallerySection } from "@/components/invitation/Gallery";
import { motion, AnimatePresence } from "framer-motion";
import { Mail } from "lucide-react";

// --- 1. IMPORT KOMPONEN BARU ---
import { RSVPForm } from "@/components/invitation/RSVPForm";
import { Guestbook } from "@/components/invitation/GuestBook";

export function InvitationClientPage({ data }: { data: InvitationData }) {
  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const { guest, wedding } = data;

  const handleOpenInvitation = () => {
    setIsCoverOpen(true);
  };

  return (
    <>
      <AudioPlayer src={wedding.music_url} isPlaying={isCoverOpen} />

      <AnimatePresence>
        {isCoverOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            <GroomBrideSection data={wedding.groom_bride} />
            <EventsSection data={wedding.events} />
            <StorySection data={wedding.stories} />
            <GallerySection data={wedding.galleries} />

            {/* --- 2. GANTI PLACEHOLDER DENGAN KOMPONEN ASLI --- */}
            {/* Hapus placeholder div */}
            
            {/* Tambahkan Komponen RSVP */}
            <RSVPForm guest={guest} />
            
            {/* Tambahkan Komponen Guestbook */}
            <Guestbook guestId={guest.id} weddingId={wedding.id} />
            {/* ----------------------------------------------- */}

          </motion.div>
        )}
      </AnimatePresence>

      {/* Cover/Hero (Tidak ada perubahan di sini) */}
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
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            
            <div className="relative z-10 text-white">
              <h1 className="text-4xl md:text-6xl font-semibold">
                {wedding.wedding_title}
              </h1>
              <p className="mt-8 text-lg">Kepada Yth.</p>
              <h2 className="text-3xl md:text-4xl font-bold mt-2">
                {guest.name}
              </h2>
              {guest.group && (
                <p className="mt-2 text-sm">({guest.group})</p>
              )}
              
              <Button 
                onClick={handleOpenInvitation} 
                className="mt-12" 
                size="lg"
                style={{
                  backgroundColor: "var(--theme-color)",
                  color: "#ffffff"
                }}
              >
                <Mail className="mr-2 h-5 w-5" />
                Buka Undangan
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}