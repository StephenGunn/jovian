import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Add security headers
	response.headers.set(
		'Strict-Transport-Security',
		'max-age=31536000; includeSubDomains; preload'
	);
	response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

	// Cache static assets aggressively
	const url = new URL(event.request.url);
	if (
		url.pathname.startsWith('/_app/') ||
		url.pathname.startsWith('/fonts/') ||
		/\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|otf|eot)$/.test(url.pathname)
	) {
		// Immutable assets (1 year cache)
		response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
	}

	return response;
};
