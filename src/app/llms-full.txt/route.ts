import { llmsFullTxt } from '../../lib/content';

// For AI assistants: the rules, then the whole English documentation in one file.
export const dynamic = 'force-static';

export function GET() {
  return new Response(llmsFullTxt(), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
