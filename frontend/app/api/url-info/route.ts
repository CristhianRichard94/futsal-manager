// app/api/url-info/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.url;
  const pathname = new URL(url).pathname;
  const searchParams = new URL(url).searchParams;
  console.log(`Request URL: ${url} - Pathname: ${pathname} - Search Params: ${searchParams.toString()}`);
  
  return NextResponse.json({
    url,
    pathname,
    searchParams: Object.fromEntries(searchParams)
  });
}