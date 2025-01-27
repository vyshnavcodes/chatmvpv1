import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { z } from 'zod';

const requestSchema = z.object({
  url: z.string().url(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { url } = requestSchema.parse(json);

    // Get the user from Supabase auth
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle0' });

      // Extract text content from relevant elements
      const content = await page.evaluate(() => {
        const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, article');
        return Array.from(elements).map(element => ({
          type: element.tagName.toLowerCase(),
          text: element.textContent?.trim() || '',
        })).filter(item => item.text.length > 0);
      });

      // Store the scraped content in Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update({
          website_url: url,
          website_content: content,
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({ success: true, contentLength: content.length });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to scrape website' },
      { status: 500 }
    );
  }
} 