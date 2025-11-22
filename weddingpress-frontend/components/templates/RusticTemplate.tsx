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
import { MailOpen, Flower2 } from "lucide-react";

export function RusticTemplate({ data }: { data: InvitationData }) {
  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const { guest, wedding } = data;

  return (
    // Background Cream/Kertas Tua
    <div className="font-serif text-[#5c4b3d] bg-[#F3EFE4] min-h-screen overflow-x-hidden">
      <AudioPlayer src={wedding.music_url} isPlaying={isCoverOpen} />

      <AnimatePresence>
        {isCoverOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-2xl mx-auto bg-[#F9F7F2] shadow-2xl min-h-screen border-x-8 border-[#e6dfce] relative"
          >
            {/* Hiasan Sudut Atas */}
            <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-[#A4907C] rounded-tl-3xl m-4 opacity-50 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-[#A4907C] rounded-tr-3xl m-4 opacity-50 pointer-events-none"></div>

            {/* Header */}
            <div className="text-center py-16 px-4">
              <motion.div 
                initial={{ scale: 0.8 }} 
                animate={{ scale: 1 }} 
                transition={{ duration: 1.5 }}
                className="inline-block border border-[#A4907C] p-8 rounded-full mb-6"
              >
                <h1 className="text-4xl md:text-6xl font-bold text-[#8D7B68] italic tracking-tighter">
                  {wedding.groom_bride.groom_name} <br/> 
                  <span className="text-2xl">&</span> <br/>
                  {wedding.groom_bride.bride_name}
                </h1>
              </motion.div>
              <p className="uppercase tracking-[0.2em] text-sm text-[#A4907C]">We Are Getting Married</p>
            </div>

            <div className="p-6 space-y-12 relative z-10">
                {/* Pembatas Bunga Simple */}
                <div className="flex justify-center text-[#A4907C] opacity-70 my-4">
                    <Flower2 className="w-8 h-8" />
                </div>

                <GroomBrideSection data={wedding.groom_bride} />
                
                {wedding.show_events && (
                    <div className="bg-[#EBE3D5] p-8 rounded-xl border border-[#dcd0bd]">
                        <EventsSection data={wedding.events} />
                    </div>
                )}

                {wedding.show_story && <StorySection data={wedding.stories} />}
                
                {wedding.show_gallery && (
                    <div className="p-4 bg-white shadow-lg rotate-1 rounded-lg">
                        <GallerySection data={wedding.galleries} />
                    </div>
                )}

                {wedding.show_gifts && wedding.gift_accounts?.length > 0 && (
                   <div className="border-y-2 border-dashed border-[#A4907C] py-8">
                      <GiftSection accounts={wedding.gift_accounts} />
                   </div>
                )}
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e6dfce]">
                    <RSVPForm guest={guest} />
                    {wedding.show_guest_book && <Guestbook guestId={guest.id} weddingId={wedding.id} />}
                </div>
            </div>
            
            {/* Footer */}
            <div className="pb-12 text-center text-[#A4907C] text-xs tracking-widest uppercase">
                 WeddingPress Rustic Edition
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Cover Rustic */}
      <AnimatePresence>
        {!isCoverOpen && (
          <motion.div
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#F3EFE4]"
            style={{
                backgroundImage: "radial-gradient(circle, #A4907C 1px, transparent 1px)",
                backgroundSize: "30px 30px"
            }}
          >
            <div className="bg-[#F9F7F2] p-10 md:p-16 shadow-xl border border-[#dcd0bd] max-w-md w-full text-center relative overflow-hidden">
                {/* Ornamen Lingkaran */}
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#EBE3D5] rounded-full opacity-50"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#EBE3D5] rounded-full opacity-50"></div>

                <p className="text-[#8D7B68] uppercase tracking-widest text-xs mb-4">The Wedding Of</p>
                <h1 className="text-5xl font-serif text-[#5c4b3d] mb-2">{wedding.groom_bride.groom_name}</h1>
                <span className="text-2xl text-[#A4907C] italic">&</span>
                <h1 className="text-5xl font-serif text-[#5c4b3d] mt-2">{wedding.groom_bride.bride_name}</h1>
                
                <div className="my-8 border-b border-[#A4907C] w-24 mx-auto"></div>

                <div className="bg-[#EBE3D5]/50 p-4 rounded-lg mb-8">
                    <p className="text-xs uppercase tracking-widest mb-2 text-[#8D7B68]">Special Invitation For</p>
                    <h3 className="text-xl font-bold text-[#5c4b3d]">{guest.name}</h3>
                    {guest.group && <p className="text-sm text-[#8D7B68] mt-1">{guest.group}</p>}
                </div>

                <Button 
                  onClick={() => setIsCoverOpen(true)}
                  className="bg-[#8D7B68] hover:bg-[#6b5d4e] text-[#F9F7F2] px-8 py-6 rounded-full text-lg transition-all hover:shadow-lg"
                >
                  <MailOpen className="mr-2 h-5 w-5" /> Buka Undangan
                </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}