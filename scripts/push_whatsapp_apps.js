const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hfdveeadispqumftcerb.supabase.co';
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmZHZlZWFkaXNwcXVtZnRjZXJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTc2ODEyOCwiZXhwIjoyMTA3MzQ0MTI4fQ.k7suEbs0pm6IXYqsQ7ncfdfxcKaLbEETEs7NMV6IwsU';

const sb = createClient(supabaseUrl, supabaseServiceKey);

const apps = [
  {
    name: 'Rummy Ludo',
    slug: 'rummyludo',
    category: 'rummy',
    download_url: 'https://rummyludoapp30.com/?code=DD2MR6TKVNK&t=1791642536',
    signup_bonus: 100,
    min_withdrawal: 100,
    rating: 4.6,
    status: 'active',
    is_featured: true,
    logo_url: '/uploads/ux9mtr6LgzyV8h1.jpg',
    short_desc:
      '**RummyLudo — Win Big & Play Instantly!**\n- 🎁 Get up to ₹100 Welcome Bonus instantly (no deposit needed)\n- Thrilling Rummy + Ludo dual action in one app\n- Super-fast cashouts and massive rewards with every game',
  },
  {
    name: 'OK Rummy',
    slug: 'okrummy',
    category: 'rummy',
    download_url: 'https://www.okrummy48.com/?code=WM9ELSSFT48&t=1791642557',
    signup_bonus: 199,
    min_withdrawal: 100,
    rating: 4.7,
    status: 'active',
    is_featured: true,
    logo_url: '/uploads/Mypse1xXkRKcrv7.png',
    short_desc:
      "**OKRUMMY — India's #1 Skilled Gaming App**\n- 🎁 Register now and get a welcome bonus up to ₹199 FREE\n- Deposit & claim up to 100% extra bonus instantly\n- Members' Day 9·19·29 with ₹9 Cr Prize Pool\n- Daily ₹99,999 mystery gift for active players",
  },
  {
    name: 'Diwa VIP',
    slug: 'diwavip-game',
    category: 'casino',
    download_url:
      'https://diwavipshare.in?pid=512784627&channel=2010001&t=pdd2&pkg=com.diwavip.app',
    signup_bonus: 108,
    min_withdrawal: 100,
    rating: 4.5,
    status: 'active',
    is_featured: false,
    logo_url: '/uploads/0214499041dcb9.jpg',
    short_desc:
      '**Diwa VIP Game — Exclusive Real Cash App**\n- 🎁 Link your mobile number and get ₹108 random cash\n- First deposit bonus up to 450%\n- Exclusive VIP rewards, fast payouts, and high winning rates',
  },
  {
    name: 'Diwa Win',
    slug: 'diwa-win',
    category: 'casino',
    download_url:
      'https://diwawinshare.io?pid=291893625&channel=2010002&t=pdd2&pkg=com.diwawin002.app',
    signup_bonus: 109,
    min_withdrawal: 100,
    rating: 4.5,
    status: 'active',
    is_featured: false,
    logo_url: '/uploads/e33bdebb984efe.jpg',
    short_desc:
      '**Diwa Win Game — Instant Rewards & Cashout**\n- 🎁 Link your mobile number and get ₹109 random cash\n- First deposit bonus up to 575%\n- Quick UPI withdrawal, fair gameplay, and daily bonus spins',
  },
  {
    name: 'Teen Patti Master',
    slug: 'teen-patti-master',
    category: 'teen_patti',
    download_url: 'https://sayhellofriends.com?k=PuLP5EfjuO',
    signup_bonus: 51,
    min_withdrawal: 100,
    rating: 4.6,
    status: 'active',
    is_featured: true,
    logo_url: '/assets/img/logo.png',
    short_desc:
      '**Teen Patti Master — Spin & Win Big Prizes**\n- 💰 Spin & win real cash prizes up to Rs. 1,00,000\n- Classic Teen Patti, Dragon vs Tiger & Slots\n- 100% verified APK with instant Bank & UPI withdrawals',
  },
];

async function seed() {
  console.log('Seeding 5 apps to Supabase...');
  for (const app of apps) {
    const { data, error } = await sb
      .from('apps')
      .upsert(app, { onConflict: 'slug' })
      .select('id, name, slug');

    if (error) {
      console.error(`Failed to upsert "${app.name}":`, error.message);
    } else {
      console.log(`✓ Upserted "${app.name}" (${app.slug}) -> ID: ${data[0]?.id}`);
    }
  }
  console.log('Finished seeding WhatsApp apps!');
}

seed();
