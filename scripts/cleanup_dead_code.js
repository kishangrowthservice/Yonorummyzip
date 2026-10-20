const fs = require('fs');
const path = require('path');

const rootFilesToDelete = [
  'all_missing_slugs.json',
  'missing_slugs.json',
  'audit_report.json',
  'new_pages_index.json',
  'new_ref_all_urls.json',
  'new_ref_screenshot.png',
  'new_ref_fullpage.png',
  'local_light_mode.png',
  'local_light_mode_tested.png',
  'local_mobile_detail.png',
  'local_mobile_home.png',
  'local_mobile_nav_clicked.png',
  'local_new_viewport.png',
  'local_new_fullpage.png'
];

const oldScriptsToDelete = [
  'audit_site.js',
  'build_pages.js',
  'capture_reference.js',
  'compare_headers.js',
  'compare_logos.js',
  'crawl_all_pages.js',
  'download_all.js',
  'download_common_deps.js',
  'download_live_logos.js',
  'download_webfonts.js',
  'dump_local_header.js',
  'extract_tab_scripts.js',
  'extract_target_header.js',
  'find_logos.js',
  'fix_all_html_images.js',
  'get_ref_logo_styles.js',
  'image_map.json',
  'inspect_fonts.js',
  'inspect_font_face.js',
  'inspect_logo_css.js',
  'legacy_server.js',
  'local_header_dom.html',
  'prepare_next_pages.js',
  'target_header.html',
  'test_interactions.js',
  'test_logos.js',
  'update_logo_and_dummy_contacts.js',
  'verify_all_pages.js',
  'check_contact_vals.js',
  'check_faq.js',
  'check_img_browser.js',
  'check_logo.js',
  'check_logos.js',
  'check_pixel_colors.js',
  'clip_logo.js',
  'debug_favicon_network.js',
  'download_new_core.js',
  'explore_new_ref.js',
  'find_all_missing_slugs.js',
  'find_all_page_links.js',
  'find_external_redirects.js',
  'find_js_redirects.js',
  'find_money_rummy.js',
  'find_subpaths.js',
  'inspect_new_site_assets.js',
  'inspect_ref_layout.js',
  'test_body_externals.js',
  'test_fixes.js',
  'test_mobile_view.js',
  'verify_new_site.js',
  'check_page_styles.js',
  'check_all_clean.js',
  'append_theme_css.js',
  'purge_old.js',
  'sync_css.js',
  'capture_game_sample.js',
  'capture_local_full.js',
  'capture_local_header.js',
  'capture_new_ref_full.js',
  'capture_ref_header.js',
  'capture_vercel_final.js'
];

let deletedCount = 0;

for (const f of rootFilesToDelete) {
  const p = path.join(__dirname, '..', f);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    deletedCount++;
    console.log('Removed root file:', f);
  }
}

for (const f of oldScriptsToDelete) {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    deletedCount++;
    console.log('Removed script:', f);
  }
}

console.log(`Cleanup complete! Deleted ${deletedCount} dead/obsolete files.`);
