"use client";

import { useState } from "react";
import { useForm, UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Guest } from "@/types/models";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ✅ Skema validasi Zod (revisi)
const rsvpFormSchema = z.object({
    attendance_status: z.enum(["hadir", "tidak_hadir"]),
    total_attendance: z.coerce
      .number()
      .int()
      .min(0, "Jumlah tidak boleh negatif")
      .max(10, "Jumlah maksimal 10 orang"),
  });

type RsvpFormValues = z.infer<typeof rsvpFormSchema>;

interface RSVPFormProps {
  guest: Guest;
}

export function RSVPForm({ guest }: RSVPFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(guest.is_rsvp);
  const [submittedAttendance, setSubmittedAttendance] = useState(
    guest.total_attendance
  );

  // ✅ Gunakan type cast aman untuk resolver agar tidak error TS
  const form = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpFormSchema) as unknown as UseFormProps<RsvpFormValues>["resolver"],
    defaultValues: {
      attendance_status:
        guest.is_rsvp && guest.total_attendance > 0
          ? "hadir"
          : guest.is_rsvp
          ? "tidak_hadir"
          : undefined,
      total_attendance: guest.total_attendance > 0 ? guest.total_attendance : 1,
    },
  });

  const attendanceStatus = form.watch("attendance_status");

  const onSubmit = async (values: RsvpFormValues) => {
    let attendanceCount = 0;
    if (values.attendance_status === "hadir") {
      attendanceCount = values.total_attendance;
      if (attendanceCount <= 0) {
        attendanceCount = 1;
      }
    }

    const rsvpData = {
      total_attendance: attendanceCount,
    };

    try {
      await api.post(`/rsvp/${guest.id}`, rsvpData);
      toast.success("RSVP Berhasil Disimpan", {
        description: "Terima kasih atas konfirmasi Anda.",
      });
      setIsSubmitted(true);
      setSubmittedAttendance(attendanceCount);
    } catch (error) {
      toast.error("Gagal Menyimpan RSVP", {
        description: "Terjadi kesalahan, silakan coba lagi.",
      });
    }
  };

  // ✅ Tampilan setelah RSVP dikirim
  if (isSubmitted) {
    return (
      <section className="bg-gray-50 p-8">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle
              className="text-center text-2xl"
              style={{ color: "var(--theme-color)" }}
            >
              Terima Kasih!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg">
              Terima kasih, {guest.name}, atas konfirmasi Anda.
            </p>
            {submittedAttendance > 0 ? (
              <p className="mt-2">
                Kami mencatat konfirmasi kehadiran Anda sebanyak{" "}
                <strong>{submittedAttendance}</strong> orang.
              </p>
            ) : (
              <p className="mt-2">
                Kami mencatat konfirmasi ketidakhadiran Anda.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    );
  }

  // ✅ Tampilan form RSVP
  return (
    <section className="bg-gray-50 p-8">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle
            className="text-center text-3xl font-semibold"
            style={{ color: "var(--theme-color)" }}
          >
            Konfirmasi Kehadiran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <p className="text-center text-gray-700">
                Mohon konfirmasi kehadiran Anda, <strong>{guest.name}</strong>.
              </p>

              <FormField
                control={form.control}
                name="attendance_status"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col md:flex-row justify-center gap-4"
                      >
                        <FormItem className="flex-1">
                          <FormControl>
                            <RadioGroupItem value="hadir" className="sr-only" />
                          </FormControl>
                          <FormLabel
                            className={`flex items-center justify-center p-4 rounded-md border-2 cursor-pointer ${
                              field.value === "hadir"
                                ? "border-[var(--theme-color)]"
                                : ""
                            }`}
                          >
                            Ya, Saya Akan Hadir
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex-1">
                          <FormControl>
                            <RadioGroupItem
                              value="tidak_hadir"
                              className="sr-only"
                            />
                          </FormControl>
                          <FormLabel
                            className={`flex items-center justify-center p-4 rounded-md border-2 cursor-pointer ${
                              field.value === "tidak_hadir"
                                ? "border-red-500"
                                : ""
                            }`}
                          >
                            Maaf, Tidak Bisa Hadir
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />

              {attendanceStatus === "hadir" && (
                <FormField
                  control={form.control}
                  name="total_attendance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jumlah Kehadiran (Termasuk Anda)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          value={field.value ?? 1}
                          onChange={(e) => {
                            const numValue = Number(e.target.value);
                            field.onChange(numValue < 1 ? 1 : numValue);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button
                type="submit"
                className="w-full text-white"
                style={{ backgroundColor: "var(--theme-color)" }}
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Menyimpan..."
                  : "Kirim Konfirmasi"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
}
