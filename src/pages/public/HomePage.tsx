import HomeHero from '../../components/features/home/HomeHero';
import HomeIntro from '../../components/features/home/HomeIntro';
import ProfileSplit from '../../components/features/home/ProfileSplit';
import GuestbookSection from '../../components/features/home/GuestbookSection';
import NextStreamWidget from '../../components/features/home/NextStreamWidget';
import AnniversaryCountdown from '../../components/features/home/AnniversaryCountdown';
import OshiMeter from '../../components/features/home/OshiMeter';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <HomeHero />
      <NextStreamWidget />
      <AnniversaryCountdown />
      <OshiMeter />
      
      <HomeIntro />
      <ProfileSplit />
      
      <GuestbookSection />
    </div>
  );
}