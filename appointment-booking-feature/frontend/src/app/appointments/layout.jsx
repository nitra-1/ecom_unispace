export const metadata = {
  title: 'Book an Appointment | Aparna',
  description:
    'Schedule a personalized in-store appointment with our sales team at Aparna showrooms.',
  openGraph: {
    title: 'Book an Appointment | Aparna',
    description: 'Visit our showrooms — book your slot now.',
  },
}

/**
 * Layout wrapper for the /appointments route segment.
 */
export default function AppointmentsLayout({ children }) {
  return (
    <section className="appointments-root">
      {children}
    </section>
  )
}
