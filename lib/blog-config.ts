import { SITE_URL } from './site-url';
export interface SiteConfig {
  name: string;
  tagline: string;
  domain: string;
  url: string;
  downloadUrl: string;
  telegramUrl: string;
  whatsappUrl: string;
  supportAvailability: string;
  minWithdrawal: string;
  withdrawalTime: string;
  bonusOffer: string;
  categories: { name: string; slug: string; description: string; icon: string }[];
}

export const SITE_CONFIG: SiteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'Yono Rummy Zip',
  tagline: "India's #1 Yono Rummy Zip — Yono Games, Rummy & Teen Patti Official Portal",
  domain: process.env.SITE_DOMAIN || 'yonorummyzip.com',
  url: SITE_URL,
  downloadUrl: '/',
  telegramUrl: 'https://t.me/yonorummyzip',
  whatsappUrl: 'https://wa.me/?text=Download%20Yono%20Games',
  supportAvailability: '24/7 Fast Customer Care Assistance',
  minWithdrawal: '₹100',
  withdrawalTime: '2-Minute Instant UPI & Bank Transfer',
  bonusOffer: '₹1,500 Free Sign-Up Welcome Bonus',
  categories: [
    {
      name: 'Yono Games Guides',
      slug: 'yono-games-guides',
      description: 'Step-by-step game guides, rules, tricks and winning strategies for all Yono apps.',
      icon: '🎮',
    },
    {
      name: 'Teen Patti & Rummy',
      slug: 'teen-patti-rummy',
      description: 'Master 13-card rummy, Teen Patti sequence tricks, and maximize your cash winnings.',
      icon: '🃏',
    },
    {
      name: 'Bonus & Withdrawals',
      slug: 'bonus-withdrawals',
      description: 'Instant UPI cashout verification, daily login rewards, and referral bonus hacks.',
      icon: '💰',
    },
    {
      name: 'APK Download & Security',
      slug: 'apk-download-security',
      description: 'Safe APK installation guidelines, anti-ban protection, and updated versions.',
      icon: '🛡️',
    },
    {
      name: 'Slot Machine & Arcade',
      slug: 'slots-arcade',
      description: 'High RTP slots, Dragon vs Tiger formulas, and crash game predictions.',
      icon: '🎰',
    },
  ],
};
