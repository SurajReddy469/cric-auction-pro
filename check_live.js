#!/usr/bin/env node

/**
 * Health check utility for Cric-Auction Pro live deployment.
 * Supports configurable target via CLI argument or TARGET_URL environment variable.
 *
 * Usage:
 *   node check_live.js
 *   node check_live.js https://my-custom-domain.com
 *   TARGET_URL=https://my-custom-domain.com node check_live.js
 */

const targetUrl = process.argv[2] || process.env.TARGET_URL || 'https://cric-auction-pro.vercel.app';

console.log(`🔍 Checking live target: ${targetUrl}`);
const startTime = Date.now();

try {
  const response = await fetch(targetUrl, {
    headers: {
      'User-Agent': 'CricAuctionHealthCheck/1.0',
    },
    redirect: 'follow',
  });

  const duration = Date.now() - startTime;
  const status = response.status;
  const statusText = response.statusText;

  console.log(`⏱️ Response received in ${duration}ms (Status: ${status} ${statusText})`);

  if (!response.ok) {
    console.error(`❌ Health check failed with status ${status}`);
    process.exit(1);
  }

  const html = await response.text();
  const hasRootDiv = html.includes('id="root"');
  const hasTitle = html.includes('<title>');

  if (hasRootDiv && hasTitle) {
    console.log(`✅ Health check passed! Root DOM container and title present.`);
    console.log(`🌐 Deployed bundle is active and healthy.`);
    process.exit(0);
  } else {
    console.warn(`⚠️ Warning: HTTP 200 returned but expected HTML tags were not found.`);
    process.exit(0);
  }
} catch (err) {
  console.error(`❌ Connection error: ${err.message}`);
  process.exit(1);
}
