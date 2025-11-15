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
            {/* Bagian Mempelai (GroomBride) biasanya selalu tampil */}
            <GroomBrideSection data={wedding.groom_bride} />

            {/* --- KONDISIONAL RENDER BERDASARKAN TOGGLE ADMIN --- */}

            {/* Tampilkan Events jika show_events adalah true */}
            {wedding.show_events && <EventsSection data={wedding.events} />}

            {/* Tampilkan Story jika show_story adalah true */}
            {wedding.show_story && <StorySection data={wedding.stories} />}

            {/* Tampilkan Gallery jika show_gallery adalah true */}
            {wedding.show_gallery && <GallerySection data={wedding.galleries} />}

            {/* Tampilkan Gifts jika show_gifts adalah true DAN ada data rekening */}
            {wedding.show_gifts && wedding.gift_accounts && wedding.gift_accounts.length > 0 && (
              <GiftSection accounts={wedding.gift_accounts} />
            )}
            
            {/* RSVP Form (mungkin selalu tampil, karena penting) */}
            <RSVPForm guest={guest} />
            
            {/* Tampilkan Guestbook jika show_guest_book adalah true */}
            {wedding.show_guest_book && (
              <Guestbook guestId={guest.id} weddingId={wedding.id} />
            )}
            
            {/* --- AKHIR KONDISIONAL RENDER --- */}
            
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
                  // Menggunakan warna tema yang sudah diatur
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