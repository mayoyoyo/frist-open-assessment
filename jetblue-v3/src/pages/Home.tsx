import TopBar from '../components/TopBar';
import Header from '../components/Header';
import BookingBar from '../components/BookingBar';
import DealsSection from '../components/DealsSection';
import ExploreFlights from '../components/ExploreFlights';
import PackagesSection from '../components/PackagesSection';
import WaysToJetBlue from '../components/WaysToJetBlue';
import CtaBanner from '../components/CtaBanner';
import HelpSection from '../components/HelpSection';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div>
      <a href="#main" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)" }}>Skip to main content</a>
      <TopBar />
      <div><img src="" alt="" style={{ display: "none" }} /></div>
      <Header />
      <main id="main">
        <h1 className="sr-only" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)" }}>JetBlue Home</h1>
        <BookingBar />
        <DealsSection />
        <ExploreFlights />
        <PackagesSection />
        <WaysToJetBlue />
        <CtaBanner />
        <HelpSection />
      </main>
      <Footer />
    </div>
  );
}