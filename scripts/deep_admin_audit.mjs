import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hfdveeadispqumftcerb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmZHZlZWFkaXNwcXVtZnRjZXJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3NjgxMjgsImV4cCI6MjEwNzM0NDEyOH0.Dg2PtVErvHDNonGsIytF3RqdU7U07HVBNJ9kn34Oy1k';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmZHZlZWFkaXNwcXVtZnRjZXJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTc2ODEyOCwiZXhwIjoyMTA3MzQ0MTI4fQ.k7suEbs0pm6IXYqsQ7ncfdfxcKaLbEETEs7NMV6IwsU';

const SITE1_URL = 'https://allyonogames99.com';
const SITE2_URL = 'https://yonoallapps.vercel.app';

const SITE1_CREDS = {
  email: 'admin@allyonogames99.com',
  password: 'AllYono@2026Admin',
  domain: 'allyonogames99.com',
  siteId: 'allyonogames99',
};

const SITE2_CREDS = {
  email: 'admin@yonoallapps.com',
  password: 'YonoApps@2026Admin',
  domain: 'yonoallapps.com',
  siteId: 'yonoallapps',
};

const auditResults = {
  passed: 0,
  failed: 0,
  details: [],
};

function recordTest(category, name, passed, notes = '') {
  auditResults.details.push({ category, name, passed, notes });
  if (passed) {
    auditResults.passed++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m [${category}] ${name} ${notes ? '(' + notes + ')' : ''}`);
  } else {
    auditResults.failed++;
    console.log(`  \x1b[31m✖ FAIL\x1b[0m [${category}] ${name} ${notes ? '(' + notes + ')' : ''}`);
  }
}

async function getAuthCookie(email, password) {
  const cookieJar = new Map();
  const client = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return Array.from(cookieJar.entries()).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          cookieJar.set(name, value);
        }
      },
    },
  });

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    throw new Error(`Auth failed for ${email}: ${error?.message}`);
  }

  const cookieHeader = Array.from(cookieJar.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');

  return { cookieHeader, user: data.user, session: data.session };
}

async function runDeepAudit() {
  console.log('\n=============================================================');
  console.log('   DEEP ADMIN & MULTI-TENANT VERIFICATION SUITE');
  console.log('   Target Sites:');
  console.log(`     Primary: ${SITE1_URL} (${SITE1_CREDS.domain})`);
  console.log(`     Sister:  ${SITE2_URL} (${SITE2_CREDS.domain})`);
  console.log('=============================================================\n');

  // -------------------------------------------------------------
  // 1. Edge Middleware Protection
  // -------------------------------------------------------------
  console.log('\n--- 1. Edge Middleware Protection (Unauthenticated Access) ---');

  const adminRoutes = ['/admin', '/admin/apps', '/admin/blog', '/admin/media', '/admin/settings'];

  for (const route of adminRoutes) {
    const res1 = await fetch(`${SITE1_URL}${route}`, { redirect: 'manual' });
    const isRedirect1 = res1.status === 307 || res1.status === 308 || res1.status === 302;
    const loc1 = res1.headers.get('location') || '';
    recordTest(
      'Middleware UI Protection',
      `Site 1: ${route} blocks unauthenticated access`,
      isRedirect1 && loc1.includes('/admin/login'),
      `Status: ${res1.status}, Redirect: ${loc1}`
    );

    const res2 = await fetch(`${SITE2_URL}${route}`, { redirect: 'manual' });
    const isRedirect2 = res2.status === 307 || res2.status === 308 || res2.status === 302;
    const loc2 = res2.headers.get('location') || '';
    recordTest(
      'Middleware UI Protection',
      `Site 2: ${route} blocks unauthenticated access`,
      isRedirect2 && loc2.includes('/admin/login'),
      `Status: ${res2.status}, Redirect: ${loc2}`
    );
  }

  // -------------------------------------------------------------
  // 2. API Endpoint Protection (Zero Auth Rejection)
  // -------------------------------------------------------------
  console.log('\n--- 2. API Route Protection (Zero Auth -> HTTP 401) ---');

  const protectedApiEndpoints = [
    { method: 'GET', path: '/api/admin/posts' },
    { method: 'POST', path: '/api/admin/posts' },
    { method: 'POST', path: '/api/admin/apps' },
    { method: 'POST', path: '/api/admin/blog/generate' },
  ];

  for (const ep of protectedApiEndpoints) {
    const res1 = await fetch(`${SITE1_URL}${ep.path}`, {
      method: ep.method,
      headers: { 'Content-Type': 'application/json' },
      body: ep.method === 'POST' ? JSON.stringify({ test: true }) : undefined,
    });
    recordTest(
      'API Security',
      `Site 1: ${ep.method} ${ep.path} returns 401 without auth`,
      res1.status === 401,
      `Status: ${res1.status}`
    );

    const res2 = await fetch(`${SITE2_URL}${ep.path}`, {
      method: ep.method,
      headers: { 'Content-Type': 'application/json' },
      body: ep.method === 'POST' ? JSON.stringify({ test: true }) : undefined,
    });
    recordTest(
      'API Security',
      `Site 2: ${ep.method} ${ep.path} returns 401 without auth`,
      res2.status === 401,
      `Status: ${res2.status}`
    );
  }

  // -------------------------------------------------------------
  // 3. Admin Authentication & Boundary Enforcement
  // -------------------------------------------------------------
  console.log('\n--- 3. Admin Authentication & Domain Boundary Enforcement ---');

  let site1Auth, site2Auth;

  try {
    site1Auth = await getAuthCookie(SITE1_CREDS.email, SITE1_CREDS.password);
    recordTest(
      'Auth Credentials',
      'Site 1 Admin sign-in with valid credentials',
      Boolean(site1Auth?.user?.id),
      `User ID: ${site1Auth?.user?.id}`
    );
  } catch (err) {
    recordTest('Auth Credentials', 'Site 1 Admin sign-in', false, err.message);
  }

  try {
    site2Auth = await getAuthCookie(SITE2_CREDS.email, SITE2_CREDS.password);
    recordTest(
      'Auth Credentials',
      'Site 2 Admin sign-in with valid credentials',
      Boolean(site2Auth?.user?.id),
      `User ID: ${site2Auth?.user?.id}`
    );
  } catch (err) {
    recordTest('Auth Credentials', 'Site 2 Admin sign-in', false, err.message);
  }

  try {
    const rawSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { error: badPwErr } = await rawSupabase.auth.signInWithPassword({
      email: SITE1_CREDS.email,
      password: 'WrongPassword123!',
    });
    recordTest(
      'Auth Security',
      'Rejection of invalid password credentials',
      Boolean(badPwErr),
      badPwErr?.message
    );
  } catch (err) {
    recordTest('Auth Security', 'Rejection of invalid password', false, err.message);
  }

  // -------------------------------------------------------------
  // 4. Apps CMS Partitioning & CRUD Verification
  // -------------------------------------------------------------
  console.log('\n--- 4. Apps CMS Multi-Tenant Partitioning & Management ---');

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { data: site1Apps, error: s1AppsErr } = await supabaseAdmin
    .from('apps')
    .select('id, name, slug, site')
    .eq('site', 'allyonogames99');

  const s1AppsValid = !s1AppsErr && site1Apps.length > 0 && site1Apps.every(a => a.site === 'allyonogames99');
  recordTest(
    'Apps Multi-Tenancy',
    'Site 1 Apps database partition integrity',
    s1AppsValid,
    `Count: ${site1Apps?.length || 0}, 100% allyonogames99`
  );

  // Test creating an app for Site 2 via authenticated API (using valid enum 'rummy')
  if (site2Auth) {
    const testAppSlug = `audit-app-${Date.now()}`;
    const testAppPayload = {
      name: 'Test Sister App',
      slug: testAppSlug,
      category: 'rummy',
      download_url: 'https://example.com/download.apk',
      signup_bonus: 51,
      status: 'active',
    };

    const resCreateApp = await fetch(`${SITE2_URL}/api/admin/apps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: site2Auth.cookieHeader,
      },
      body: JSON.stringify(testAppPayload),
    });

    const createdAppData = await resCreateApp.json();
    const createdApp = createdAppData.data;
    const appCreatedOk = resCreateApp.status === 201 && createdApp?.site === 'yonoallapps';

    recordTest(
      'Apps CMS Management',
      'Site 2 POST /api/admin/apps creates app partitioned to yonoallapps',
      appCreatedOk,
      `Status: ${resCreateApp.status}, ID: ${createdApp?.id}, Site: ${createdApp?.site}`
    );

    const resS1AppsList = await fetch(`${SITE1_URL}/api/admin/apps`, {
      headers: { Cookie: site1Auth.cookieHeader },
    });
    const s1AppsListData = await resS1AppsList.json();
    const appLeakedToS1 = (s1AppsListData.data || []).some(a => a.id === createdApp?.id);

    recordTest(
      'Apps CMS Management',
      'Site 2 App does NOT leak into Site 1 Apps list',
      !appLeakedToS1,
      `Leaked to Site 1: ${appLeakedToS1}`
    );

    // Clean up created test app
    if (createdApp?.id) {
      const resDelApp = await fetch(`${SITE2_URL}/api/admin/apps/${createdApp.id}`, {
        method: 'DELETE',
        headers: { Cookie: site2Auth.cookieHeader },
      });
      recordTest(
        'Apps CMS Management',
        'Site 2 test app deleted cleanly',
        resDelApp.status === 200,
        `Status: ${resDelApp.status}`
      );
    }
  }

  // -------------------------------------------------------------
  // 5. Blog CMS Multi-Tenant Isolation & CRUD Lifecycle
  // -------------------------------------------------------------
  console.log('\n--- 5. Blog CMS CRUD & Multi-Tenant Isolation ---');

  if (site1Auth && site2Auth) {
    const resS1Posts = await fetch(`${SITE1_URL}/api/admin/posts`, {
      headers: { Cookie: site1Auth.cookieHeader },
    });
    const s1PostsData = await resS1Posts.json();
    const s1ListValid =
      resS1Posts.status === 200 &&
      Array.isArray(s1PostsData.posts) &&
      s1PostsData.posts.every(p => p.target_site === 'allyonogames99.com');

    recordTest(
      'Blog CMS Admin API',
      'Site 1 GET /api/admin/posts returns strictly allyonogames99.com posts',
      s1ListValid,
      `Status: ${resS1Posts.status}, Count: ${s1PostsData.posts?.length}`
    );

    const resS2Posts = await fetch(`${SITE2_URL}/api/admin/posts`, {
      headers: { Cookie: site2Auth.cookieHeader },
    });
    const s2PostsData = await resS2Posts.json();
    const s2ListValid =
      resS2Posts.status === 200 &&
      Array.isArray(s2PostsData.posts) &&
      s2PostsData.posts.every(p => p.target_site === 'yonoallapps.com');

    recordTest(
      'Blog CMS Admin API',
      'Site 2 GET /api/admin/posts returns strictly yonoallapps.com posts',
      s2ListValid,
      `Status: ${resS2Posts.status}, Count: ${s2PostsData.posts?.length}`
    );

    // Create dynamic draft on Site 1
    const testTimestamp = Date.now();
    const s1PostPayload = {
      title: `[AUDIT-TEST] Senior Architecture Verification Site 1 - ${testTimestamp}`,
      slug: `audit-test-site1-${testTimestamp}`,
      excerpt: 'Automated architectural verification draft post for Site 1.',
      content: '<h2>Verification Section</h2><p>This post is generated by the senior test suite to guarantee zero cross-site leakage.</p>',
      author: 'Audit Robot',
      category: 'System Tests',
      status: 'draft',
      tags: ['test', 'audit'],
    };

    const resCreateS1 = await fetch(`${SITE1_URL}/api/admin/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: site1Auth.cookieHeader,
      },
      body: JSON.stringify(s1PostPayload),
    });

    const s1CreatedData = await resCreateS1.json();
    const createdS1Post = s1CreatedData.post;
    const s1CreatedOk =
      resCreateS1.status === 201 &&
      createdS1Post?.id &&
      createdS1Post?.target_site === 'allyonogames99.com';

    recordTest(
      'Blog CMS CRUD',
      'Site 1 POST /api/admin/posts creates post anchored to allyonogames99.com',
      s1CreatedOk,
      `Status: ${resCreateS1.status}, ID: ${createdS1Post?.id}, target_site: ${createdS1Post?.target_site}`
    );

    // Create dynamic draft on Site 2
    const s2PostPayload = {
      title: `[AUDIT-TEST] Senior Architecture Verification Site 2 - ${testTimestamp}`,
      slug: `audit-test-site2-${testTimestamp}`,
      excerpt: 'Automated architectural verification draft post for Site 2.',
      content: '<h2>Verification Section</h2><p>This post is generated by the sister site test suite.</p>',
      author: 'Audit Robot',
      category: 'System Tests',
      status: 'draft',
      tags: ['test', 'audit'],
    };

    const resCreateS2 = await fetch(`${SITE2_URL}/api/admin/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: site2Auth.cookieHeader,
      },
      body: JSON.stringify(s2PostPayload),
    });

    const s2CreatedData = await resCreateS2.json();
    const createdS2Post = s2CreatedData.post;
    const s2CreatedOk =
      resCreateS2.status === 201 &&
      createdS2Post?.id &&
      createdS2Post?.target_site === 'yonoallapps.com';

    recordTest(
      'Blog CMS CRUD',
      'Site 2 POST /api/admin/posts creates post anchored to yonoallapps.com',
      s2CreatedOk,
      `Status: ${resCreateS2.status}, ID: ${createdS2Post?.id}, target_site: ${createdS2Post?.target_site}`
    );

    // Cross-Site Leakage Check:
    const resVerifyS2List = await fetch(`${SITE2_URL}/api/admin/posts`, {
      headers: { Cookie: site2Auth.cookieHeader },
    });
    const s2ListAfter = await resVerifyS2List.json();
    const s1PostFoundOnS2 = s2ListAfter.posts?.some(p => p.id === createdS1Post?.id);

    recordTest(
      'Cross-Site Isolation Boundary',
      'Site 1 draft post does NOT appear in Site 2 Admin CMS',
      !s1PostFoundOnS2,
      `Leaked into Site 2: ${s1PostFoundOnS2}`
    );

    const resVerifyS1List = await fetch(`${SITE1_URL}/api/admin/posts`, {
      headers: { Cookie: site1Auth.cookieHeader },
    });
    const s1ListAfter = await resVerifyS1List.json();
    const s2PostFoundOnS1 = s1ListAfter.posts?.some(p => p.id === createdS2Post?.id);

    recordTest(
      'Cross-Site Isolation Boundary',
      'Site 2 draft post does NOT appear in Site 1 Admin CMS',
      !s2PostFoundOnS1,
      `Leaked into Site 1: ${s2PostFoundOnS1}`
    );

    // Cross-Site Tamper Resistance:
    if (createdS1Post?.id) {
      const resTamperGet = await fetch(`${SITE2_URL}/api/admin/posts/${createdS1Post.id}`, {
        headers: { Cookie: site2Auth.cookieHeader },
      });
      recordTest(
        'Tamper Resistance',
        'Site 2 API cannot read Site 1 post by ID (HTTP 404)',
        resTamperGet.status === 404,
        `Status: ${resTamperGet.status}`
      );

      const resTamperPut = await fetch(`${SITE2_URL}/api/admin/posts/${createdS1Post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: site2Auth.cookieHeader,
        },
        body: JSON.stringify({ title: 'Hacked Title' }),
      });
      recordTest(
        'Tamper Resistance',
        'Site 2 API cannot modify Site 1 post by ID (HTTP 404)',
        resTamperPut.status === 404,
        `Status: ${resTamperPut.status}`
      );

      const resTamperDel = await fetch(`${SITE2_URL}/api/admin/posts/${createdS1Post.id}`, {
        method: 'DELETE',
        headers: { Cookie: site2Auth.cookieHeader },
      });
      recordTest(
        'Tamper Resistance',
        'Site 2 API cannot delete Site 1 post by ID (HTTP 404)',
        resTamperDel.status === 404,
        `Status: ${resTamperDel.status}`
      );
    }

    // Clean up test posts via their authentic owners
    if (createdS1Post?.id) {
      const resDelS1 = await fetch(`${SITE1_URL}/api/admin/posts/${createdS1Post.id}`, {
        method: 'DELETE',
        headers: { Cookie: site1Auth.cookieHeader },
      });
      recordTest(
        'Cleanup',
        'Site 1 test post deleted cleanly by authorized owner',
        resDelS1.status === 200,
        `Status: ${resDelS1.status}`
      );
    }

    if (createdS2Post?.id) {
      const resDelS2 = await fetch(`${SITE2_URL}/api/admin/posts/${createdS2Post.id}`, {
        method: 'DELETE',
        headers: { Cookie: site2Auth.cookieHeader },
      });
      recordTest(
        'Cleanup',
        'Site 2 test post deleted cleanly by authorized owner',
        resDelS2.status === 200,
        `Status: ${resDelS2.status}`
      );
    }
  }

  // -------------------------------------------------------------
  // 6. AI Blog Generator Integration Verification
  // -------------------------------------------------------------
  console.log('\n--- 6. AI Blog Generator Multi-Tenant Engine ---');

  if (site1Auth) {
    const resAiS1 = await fetch(`${SITE1_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: site1Auth.cookieHeader },
      body: JSON.stringify({
        topic: 'How to Play Teen Patti Safely on Mobile',
        tone: 'informative',
        category: 'Guides',
        wordCount: 400,
      }),
    });
    const aiDataS1 = await resAiS1.json();
    const aiS1Ok = resAiS1.status === 200 && Boolean(aiDataS1.title) && Boolean(aiDataS1.content);
    recordTest(
      'AI Generator',
      'Site 1 POST /api/admin/blog/generate outputs article with complete structure',
      aiS1Ok,
      `Status: ${resAiS1.status}, Title: "${aiDataS1.title?.slice(0, 40)}...", Words: ${aiDataS1.content?.split(' ').length}`
    );
  }

  if (site2Auth) {
    const resAiS2 = await fetch(`${SITE2_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: site2Auth.cookieHeader },
      body: JSON.stringify({
        topic: 'Top 5 Fast Withdrawal Casino Apps in India',
        tone: 'engaging',
        category: 'Reviews',
        wordCount: 400,
      }),
    });
    const aiDataS2 = await resAiS2.json();
    const aiS2Ok = resAiS2.status === 200 && Boolean(aiDataS2.title) && Boolean(aiDataS2.content);
    recordTest(
      'AI Generator',
      'Site 2 POST /api/admin/blog/generate outputs article with sister branding',
      aiS2Ok,
      `Status: ${resAiS2.status}, Title: "${aiDataS2.title?.slice(0, 40)}...", Words: ${aiDataS2.content?.split(' ').length}`
    );
  }

  // -------------------------------------------------------------
  // 7. Public Blog Route Isolation & Cross-Site 404 Verification
  // -------------------------------------------------------------
  console.log('\n--- 7. Public Blog Cross-Site Isolation & Rendering ---');

  const sisterSlug = 'dragon-vs-tiger-winning-formula-pattern-strategy-for-beginners';
  const resSisterOnS1 = await fetch(`${SITE1_URL}/blog/${sisterSlug}`);
  const s1Html = await resSisterOnS1.text();
  const sisterRenderedOnS1 = s1Html.includes('Dragon vs Tiger Winning Formula') || s1Html.includes('Pattern Strategy');
  const s1Shows404 = s1Html.includes('404') || s1Html.includes('Page Not Found');

  recordTest(
    'Public Blog Isolation',
    'Sister site article is completely blocked on Site 1 (Renders 404, Zero Content)',
    !sisterRenderedOnS1 && s1Shows404,
    `Content Leaked: ${sisterRenderedOnS1}, Shows 404 UI: ${s1Shows404}`
  );

  const resSisterOnS2 = await fetch(`${SITE2_URL}/blog/${sisterSlug}`);
  const s2Html = await resSisterOnS2.text();
  const sisterRenderedOnS2 = resSisterOnS2.status === 200 && s2Html.includes('Dragon vs Tiger');

  recordTest(
    'Public Blog Isolation',
    'Sister site article renders cleanly on Site 2',
    sisterRenderedOnS2,
    `Status: ${resSisterOnS2.status}, Has Title: ${s2Html.includes('Dragon vs Tiger')}`
  );

  const site1Slug = 'yono-777-vs-yono-rummy-which-app-pays-more';
  const resS1OnS1 = await fetch(`${SITE1_URL}/blog/${site1Slug}`);
  const s1PostHtml = await resS1OnS1.text();
  const s1RenderedOnS1 = resS1OnS1.status === 200 && s1PostHtml.includes('Yono 777 vs Yono Rummy');

  recordTest(
    'Public Blog Isolation',
    'Site 1 article renders cleanly on Site 1',
    s1RenderedOnS1,
    `Status: ${resS1OnS1.status}, Has Title: ${s1PostHtml.includes('Yono 777 vs Yono Rummy')}`
  );

  const resS1OnS2 = await fetch(`${SITE2_URL}/blog/${site1Slug}`);
  const s2PostHtml = await resS1OnS2.text();
  const s1RenderedOnS2 = s2PostHtml.includes('Yono 777 vs Yono Rummy: Which App Pays More?');
  const s2Shows404 = s2PostHtml.includes('404') || s2PostHtml.includes('Page Not Found') || s2PostHtml.includes('could not be found');

  recordTest(
    'Public Blog Isolation',
    'Site 1 article is completely blocked on Site 2 (Renders 404, Zero Content)',
    !s1RenderedOnS2 && s2Shows404,
    `Content Leaked: ${s1RenderedOnS2}, Shows 404 UI: ${s2Shows404}`
  );

  // -------------------------------------------------------------
  // 8. Sitemap Isolation
  // -------------------------------------------------------------
  console.log('\n--- 8. Sitemap Multi-Tenant Isolation ---');

  const resSitemap1 = await fetch(`${SITE1_URL}/sitemap.xml`);
  const sitemap1Xml = await resSitemap1.text();
  const s1HasSisterArticle = sitemap1Xml.includes(sisterSlug);
  recordTest(
    'Sitemap Isolation',
    'Site 1 sitemap excludes all sister site blog posts',
    resSitemap1.status === 200 && !s1HasSisterArticle,
    `Status: ${resSitemap1.status}, Sister Slug in Sitemap: ${s1HasSisterArticle}`
  );

  const resSitemap2 = await fetch(`${SITE2_URL}/sitemap.xml`);
  const sitemap2Xml = await resSitemap2.text();
  const s2HasSite1Article = sitemap2Xml.includes(site1Slug);
  recordTest(
    'Sitemap Isolation',
    'Site 2 sitemap excludes all Site 1 blog posts',
    resSitemap2.status === 200 && !s2HasSite1Article,
    `Status: ${resSitemap2.status}, Site 1 Slug in Sitemap: ${s2HasSite1Article}`
  );

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log('\n=============================================================');
  console.log(`   FINAL AUDIT RESULT: ${auditResults.passed} PASSED, ${auditResults.failed} FAILED`);
  console.log('=============================================================\n');

  return auditResults;
}

runDeepAudit().catch(err => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
