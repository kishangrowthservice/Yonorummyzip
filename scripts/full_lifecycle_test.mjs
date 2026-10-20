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
  name: 'All Yono Games 99',
  siteId: 'allyonogames99',
};

const SITE2_CREDS = {
  email: 'admin@yonoallapps.com',
  password: 'YonoApps@2026Admin',
  domain: 'yonoallapps.com',
  name: 'Yono All Apps',
  siteId: 'yonoallapps',
};

const results = {
  passed: 0,
  failed: 0,
  details: [],
};

function record(section, testName, passed, info = '') {
  results.details.push({ section, testName, passed, info });
  if (passed) {
    results.passed++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m [${section}] ${testName} ${info ? '(' + info + ')' : ''}`);
  } else {
    results.failed++;
    console.log(`  \x1b[31m✖ FAIL\x1b[0m [${section}] ${testName} ${info ? '(' + info + ')' : ''}`);
  }
}

async function getAuth(email, password) {
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

// 1x1 transparent PNG buffer
const dummyPngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

async function runFullTest() {
  console.log('\n=============================================================');
  console.log('   COMPLETE LIVE END-TO-END WORKING TEST SUITE');
  console.log('   Testing: Login -> Upload -> AI Writing -> Blog CRUD -> Apps CRUD');
  console.log(`   Site 1: ${SITE1_URL} (${SITE1_CREDS.domain})`);
  console.log(`   Site 2: ${SITE2_URL} (${SITE2_CREDS.domain})`);
  console.log('=============================================================\n');

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // -------------------------------------------------------------
  // 1. Login & Auth Flow
  // -------------------------------------------------------------
  console.log('\n--- 1. Login & Auth Flow ---');

  let s1Auth, s2Auth;
  try {
    s1Auth = await getAuth(SITE1_CREDS.email, SITE1_CREDS.password);
    record('Auth Flow', 'Site 1 Admin Login Success', Boolean(s1Auth.user?.id), `Email: ${s1Auth.user.email}`);
  } catch (err) {
    record('Auth Flow', 'Site 1 Admin Login', false, err.message);
  }

  try {
    s2Auth = await getAuth(SITE2_CREDS.email, SITE2_CREDS.password);
    record('Auth Flow', 'Site 2 Admin Login Success', Boolean(s2Auth.user?.id), `Email: ${s2Auth.user.email}`);
  } catch (err) {
    record('Auth Flow', 'Site 2 Admin Login', false, err.message);
  }

  if (!s1Auth || !s2Auth) {
    console.error('Authentication failed, stopping tests.');
    process.exit(1);
  }

  // -------------------------------------------------------------
  // 2. Upload / Media API (/api/admin/upload)
  // -------------------------------------------------------------
  console.log('\n--- 2. Media / Image Upload API ---');

  // Test Upload on Site 1
  try {
    const formData1 = new FormData();
    const blob1 = new Blob([dummyPngBuffer], { type: 'image/png' });
    formData1.append('file', blob1, `test-audit-${Date.now()}.png`);
    formData1.append('folder', 'audit-test');

    const resUpload1 = await fetch(`${SITE1_URL}/api/admin/upload`, {
      method: 'POST',
      headers: { Cookie: s1Auth.cookieHeader },
      body: formData1,
    });

    const upload1Data = await resUpload1.json();
    const upload1Ok = resUpload1.status === 201 && upload1Data.url && upload1Data.url.startsWith('http');
    record('Upload API', 'Site 1 image upload to Supabase Storage', upload1Ok, `Status: ${resUpload1.status}, URL: ${upload1Data.url}`);

    // Verify public URL is reachable
    if (upload1Ok) {
      const resImgCheck = await fetch(upload1Data.url);
      record('Upload API', 'Site 1 uploaded image publicly accessible', resImgCheck.status === 200, `Image Status: ${resImgCheck.status}`);

      // Cleanup
      if (upload1Data.fileName) {
        await supabaseAdmin.storage.from('apps').remove([upload1Data.fileName]);
      }
    }
  } catch (err) {
    record('Upload API', 'Site 1 image upload', false, err.message);
  }

  // Test Upload on Site 2
  try {
    const formData2 = new FormData();
    const blob2 = new Blob([dummyPngBuffer], { type: 'image/png' });
    formData2.append('file', blob2, `test-audit-sister-${Date.now()}.png`);
    formData2.append('folder', 'audit-test');

    const resUpload2 = await fetch(`${SITE2_URL}/api/admin/upload`, {
      method: 'POST',
      headers: { Cookie: s2Auth.cookieHeader },
      body: formData2,
    });

    const upload2Data = await resUpload2.json();
    const upload2Ok = resUpload2.status === 201 && upload2Data.url && upload2Data.url.startsWith('http');
    record('Upload API', 'Site 2 image upload to Supabase Storage', upload2Ok, `Status: ${resUpload2.status}, URL: ${upload2Data.url}`);

    // Verify public URL is reachable
    if (upload2Ok) {
      const resImgCheck2 = await fetch(upload2Data.url);
      record('Upload API', 'Site 2 uploaded image publicly accessible', resImgCheck2.status === 200, `Image Status: ${resImgCheck2.status}`);

      // Cleanup
      if (upload2Data.fileName) {
        await supabaseAdmin.storage.from('apps').remove([upload2Data.fileName]);
      }
    }
  } catch (err) {
    record('Upload API', 'Site 2 image upload', false, err.message);
  }

  // -------------------------------------------------------------
  // 3. AI Blog Generator (/api/admin/blog/generate)
  // -------------------------------------------------------------
  console.log('\n--- 3. AI Blog Writing & Generation ---');

  // AI Gen Site 1
  try {
    const resAi1 = await fetch(`${SITE1_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: s1Auth.cookieHeader },
      body: JSON.stringify({
        topic: 'Best Online Rummy Winning Hacks',
        tone: 'informative',
        category: 'Tips & Tricks',
        wordCount: 350,
      }),
    });
    const ai1Data = await resAi1.json();
    const ai1Valid =
      resAi1.status === 200 &&
      Boolean(ai1Data.title) &&
      Boolean(ai1Data.content) &&
      Boolean(ai1Data.slug);

    record(
      'AI Blog Writing',
      'Site 1 generates complete structured blog post',
      ai1Valid,
      `Status: ${resAi1.status}, Title: "${ai1Data.title?.slice(0, 35)}...", Words: ${ai1Data.content?.split(' ').length}`
    );
  } catch (err) {
    record('AI Blog Writing', 'Site 1 AI Blog Generation', false, err.message);
  }

  // AI Gen Site 2
  try {
    const resAi2 = await fetch(`${SITE2_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: s2Auth.cookieHeader },
      body: JSON.stringify({
        topic: 'How to Play Teen Patti Safely on Yono All Apps',
        tone: 'professional',
        category: 'Guides',
        wordCount: 350,
      }),
    });
    const ai2Data = await resAi2.json();
    const ai2Valid =
      resAi2.status === 200 &&
      Boolean(ai2Data.title) &&
      Boolean(ai2Data.content) &&
      Boolean(ai2Data.slug);

    record(
      'AI Blog Writing',
      'Site 2 generates complete structured blog post',
      ai2Valid,
      `Status: ${resAi2.status}, Title: "${ai2Data.title?.slice(0, 35)}...", Words: ${ai2Data.content?.split(' ').length}`
    );
  } catch (err) {
    record('AI Blog Writing', 'Site 2 AI Blog Generation', false, err.message);
  }

  // -------------------------------------------------------------
  // 4. Blog CMS Full CRUD Lifecycle & Strict Isolation
  // -------------------------------------------------------------
  console.log('\n--- 4. Blog CMS Full CRUD Lifecycle & Isolation ---');

  const ts = Date.now();

  // Create on Site 1
  let s1PostId;
  const resS1Create = await fetch(`${SITE1_URL}/api/admin/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: s1Auth.cookieHeader },
    body: JSON.stringify({
      title: `[LIFECYCLE-TEST] Site 1 Post - ${ts}`,
      slug: `lifecycle-site1-${ts}`,
      excerpt: 'Full lifecycle verification test for Site 1.',
      content: '<h2>Heading</h2><p>This is test content.</p>',
      author: 'QA Lead',
      category: 'Guides',
      status: 'draft',
      tags: ['qa', 'test'],
    }),
  });
  const s1Created = await resS1Create.json();
  s1PostId = s1Created.post?.id;
  record('Blog CRUD', 'Site 1: Create draft post', resS1Create.status === 201 && Boolean(s1PostId), `ID: ${s1PostId}`);

  // Read on Site 1
  if (s1PostId) {
    const resS1Read = await fetch(`${SITE1_URL}/api/admin/posts/${s1PostId}`, {
      headers: { Cookie: s1Auth.cookieHeader },
    });
    const s1ReadData = await resS1Read.json();
    record('Blog CRUD', 'Site 1: Read post by ID', resS1Read.status === 200 && s1ReadData.post?.id === s1PostId);

    // Update on Site 1
    const resS1Update = await fetch(`${SITE1_URL}/api/admin/posts/${s1PostId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: s1Auth.cookieHeader },
      body: JSON.stringify({
        title: `[LIFECYCLE-TEST] Site 1 Post Updated - ${ts}`,
        status: 'published',
      }),
    });
    const s1UpdateData = await resS1Update.json();
    record(
      'Blog CRUD',
      'Site 1: Update post title and status',
      resS1Update.status === 200 && s1UpdateData.post?.status === 'published'
    );

    // Verify Site 2 cannot read it (Isolation)
    const resCrossRead = await fetch(`${SITE2_URL}/api/admin/posts/${s1PostId}`, {
      headers: { Cookie: s2Auth.cookieHeader },
    });
    record('Blog Isolation', 'Site 2 cannot read Site 1 post (Returns 404)', resCrossRead.status === 404, `Status: ${resCrossRead.status}`);

    // Delete on Site 1
    const resS1Del = await fetch(`${SITE1_URL}/api/admin/posts/${s1PostId}`, {
      method: 'DELETE',
      headers: { Cookie: s1Auth.cookieHeader },
    });
    record('Blog CRUD', 'Site 1: Delete post by ID', resS1Del.status === 200);

    // Verify Deleted
    const resS1VerifyDel = await fetch(`${SITE1_URL}/api/admin/posts/${s1PostId}`, {
      headers: { Cookie: s1Auth.cookieHeader },
    });
    record('Blog CRUD', 'Site 1: Confirm post no longer exists (Returns 404)', resS1VerifyDel.status === 404);
  }

  // Create on Site 2
  let s2PostId;
  const resS2Create = await fetch(`${SITE2_URL}/api/admin/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: s2Auth.cookieHeader },
    body: JSON.stringify({
      title: `[LIFECYCLE-TEST] Site 2 Post - ${ts}`,
      slug: `lifecycle-site2-${ts}`,
      excerpt: 'Full lifecycle verification test for Site 2.',
      content: '<h2>Heading</h2><p>This is test content.</p>',
      author: 'QA Lead',
      category: 'Guides',
      status: 'draft',
      tags: ['qa', 'test'],
    }),
  });
  const s2Created = await resS2Create.json();
  s2PostId = s2Created.post?.id;
  record('Blog CRUD', 'Site 2: Create draft post', resS2Create.status === 201 && Boolean(s2PostId), `ID: ${s2PostId}`);

  // Read on Site 2
  if (s2PostId) {
    const resS2Read = await fetch(`${SITE2_URL}/api/admin/posts/${s2PostId}`, {
      headers: { Cookie: s2Auth.cookieHeader },
    });
    const s2ReadData = await resS2Read.json();
    record('Blog CRUD', 'Site 2: Read post by ID', resS2Read.status === 200 && s2ReadData.post?.id === s2PostId);

    // Update on Site 2
    const resS2Update = await fetch(`${SITE2_URL}/api/admin/posts/${s2PostId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: s2Auth.cookieHeader },
      body: JSON.stringify({
        title: `[LIFECYCLE-TEST] Site 2 Post Updated - ${ts}`,
        status: 'published',
      }),
    });
    const s2UpdateData = await resS2Update.json();
    record(
      'Blog CRUD',
      'Site 2: Update post title and status',
      resS2Update.status === 200 && s2UpdateData.post?.status === 'published'
    );

    // Verify Site 1 cannot read it (Isolation)
    const resCrossRead2 = await fetch(`${SITE1_URL}/api/admin/posts/${s2PostId}`, {
      headers: { Cookie: s1Auth.cookieHeader },
    });
    record('Blog Isolation', 'Site 1 cannot read Site 2 post (Returns 404)', resCrossRead2.status === 404, `Status: ${resCrossRead2.status}`);

    // Delete on Site 2
    const resS2Del = await fetch(`${SITE2_URL}/api/admin/posts/${s2PostId}`, {
      method: 'DELETE',
      headers: { Cookie: s2Auth.cookieHeader },
    });
    record('Blog CRUD', 'Site 2: Delete post by ID', resS2Del.status === 200);

    // Verify Deleted
    const resS2VerifyDel = await fetch(`${SITE2_URL}/api/admin/posts/${s2PostId}`, {
      headers: { Cookie: s2Auth.cookieHeader },
    });
    record('Blog CRUD', 'Site 2: Confirm post no longer exists (Returns 404)', resS2VerifyDel.status === 404);
  }

  // -------------------------------------------------------------
  // 5. Apps CMS Full CRUD Lifecycle & Partitioning
  // -------------------------------------------------------------
  console.log('\n--- 5. Apps CMS Full CRUD & Partitioning ---');

  // Create App on Site 1
  let s1AppId;
  const resS1AppCreate = await fetch(`${SITE1_URL}/api/admin/apps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: s1Auth.cookieHeader },
    body: JSON.stringify({
      name: `Site 1 Test App ${ts}`,
      slug: `site1-test-app-${ts}`,
      category: 'rummy',
      download_url: 'https://example.com/site1.apk',
      signup_bonus: 51,
      status: 'active',
    }),
  });
  const s1AppCreated = await resS1AppCreate.json();
  s1AppId = s1AppCreated.data?.id;
  record(
    'Apps CRUD',
    'Site 1: Create app partitioned to allyonogames99',
    resS1AppCreate.status === 201 && s1AppCreated.data?.site === 'allyonogames99',
    `ID: ${s1AppId}`
  );

  // Update App on Site 1
  if (s1AppId) {
    const resS1AppUpdate = await fetch(`${SITE1_URL}/api/admin/apps/${s1AppId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: s1Auth.cookieHeader },
      body: JSON.stringify({ signup_bonus: 99 }),
    });
    const s1AppUpdated = await resS1AppUpdate.json();
    record(
      'Apps CRUD',
      'Site 1: Update app bonus value',
      resS1AppUpdate.status === 200 && s1AppUpdated.data?.signup_bonus === 99
    );

    // Delete App on Site 1
    const resS1AppDel = await fetch(`${SITE1_URL}/api/admin/apps/${s1AppId}`, {
      method: 'DELETE',
      headers: { Cookie: s1Auth.cookieHeader },
    });
    record('Apps CRUD', 'Site 1: Delete app cleanly', resS1AppDel.status === 200);
  }

  // Create App on Site 2
  let s2AppId;
  const resS2AppCreate = await fetch(`${SITE2_URL}/api/admin/apps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: s2Auth.cookieHeader },
    body: JSON.stringify({
      name: `Site 2 Test App ${ts}`,
      slug: `site2-test-app-${ts}`,
      category: 'casino',
      download_url: 'https://example.com/site2.apk',
      signup_bonus: 66,
      status: 'active',
    }),
  });
  const s2AppCreated = await resS2AppCreate.json();
  s2AppId = s2AppCreated.data?.id;
  record(
    'Apps CRUD',
    'Site 2: Create app partitioned to yonoallapps',
    resS2AppCreate.status === 201 && s2AppCreated.data?.site === 'yonoallapps',
    `ID: ${s2AppId}`
  );

  // Update App on Site 2
  if (s2AppId) {
    const resS2AppUpdate = await fetch(`${SITE2_URL}/api/admin/apps/${s2AppId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: s2Auth.cookieHeader },
      body: JSON.stringify({ signup_bonus: 100 }),
    });
    const s2AppUpdated = await resS2AppUpdate.json();
    record(
      'Apps CRUD',
      'Site 2: Update app bonus value',
      resS2AppUpdate.status === 200 && s2AppUpdated.data?.signup_bonus === 100
    );

    // Delete App on Site 2
    const resS2AppDel = await fetch(`${SITE2_URL}/api/admin/apps/${s2AppId}`, {
      method: 'DELETE',
      headers: { Cookie: s2Auth.cookieHeader },
    });
    record('Apps CRUD', 'Site 2: Delete app cleanly', resS2AppDel.status === 200);
  }

  // -------------------------------------------------------------
  // 6. Public Pages Verification (HTTP 200 & Health)
  // -------------------------------------------------------------
  console.log('\n--- 6. Public Portal Health Checks ---');

  const publicRoutes = ['/', '/blog', '/about', '/contact', '/privacy-policy', '/terms', '/sitemap.xml', '/robots.txt'];

  for (const p of publicRoutes) {
    const r1 = await fetch(`${SITE1_URL}${p}`);
    record('Public Pages', `Site 1: ${p} is healthy (200 OK)`, r1.status === 200, `Status: ${r1.status}`);

    const r2 = await fetch(`${SITE2_URL}${p}`);
    record('Public Pages', `Site 2: ${p} is healthy (200 OK)`, r2.status === 200, `Status: ${r2.status}`);
  }

  // -------------------------------------------------------------
  // Final Scorecard
  // -------------------------------------------------------------
  console.log('\n=============================================================');
  console.log(`   FULL TEST COMPLETED: ${results.passed} PASSED, ${results.failed} FAILED`);
  console.log('=============================================================\n');

  return results;
}

runFullTest().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
