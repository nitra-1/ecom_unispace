import { getSiteUrl } from '@/lib/GetBaseUrl';
import AppointmentBooking from './(component)/AppointmentBooking';

export const metadata = {
  title: 'Book a Consultation – Aparna',
  description:
    'Schedule a one-on-one consultation-cum-sale session with an Aparna product specialist for Tiles, Kitchen, Wardrobe, Flooring, or Lighting.',
  openGraph: {
    title: 'Book a Consultation – Aparna',
    url: `${getSiteUrl()}appointment`,
    siteName: 'Aparna',
    type: 'website',
  },
};

export default function AppointmentPage() {
  return <AppointmentBooking />;
}
