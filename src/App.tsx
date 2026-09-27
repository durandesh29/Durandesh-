import React, { useState } from 'react';
import { BarbershopProvider } from './context/BarbershopContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { MastersSection } from './components/MastersSection';
import { LocationsSection } from './components/LocationsSection';
import { ReviewsSection } from './components/ReviewsSection';
import { YandexMapSection } from './components/YandexMapSection';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { AuthModal } from './components/AuthModal';
import { MyAppointmentsModal } from './components/MyAppointmentsModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { ChatWidget } from './components/ChatWidget';
import { ReviewModal } from './components/ReviewModal';
import { DiscountsModal } from './components/DiscountsModal';

function BarbershopApp() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMyAppointmentsOpen, setIsMyAppointmentsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Navigation */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenMyAppointments={() => setIsMyAppointmentsOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        <Hero />
        <ServicesSection />
        <MastersSection />
        <LocationsSection />
        <ReviewsSection />
        <YandexMapSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Overlays */}
      <BookingModal onOpenMyAppointments={() => setIsMyAppointmentsOpen(true)} />
      
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <MyAppointmentsModal
        isOpen={isMyAppointmentsOpen}
        onClose={() => setIsMyAppointmentsOpen(false)}
        onOpenBooking={() => {}}
      />

      <AdminPanelModal />

      <ReviewModal />

      <DiscountsModal />

      {/* Interactive Floating Chat Widget with Masters & Salon */}
      <ChatWidget />
    </div>
  );
}

export default function App() {
  return (
    <BarbershopProvider>
      <BarbershopApp />
    </BarbershopProvider>
  );
}
