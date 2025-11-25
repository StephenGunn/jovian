import { handler } from './build/handler.js';
import express from 'express';

const app = express();

// Add security headers middleware for ALL routes (including prerendered)
app.use((req, res, next) => {
	res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
	res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
	res.setHeader('X-Frame-Options', 'DENY');
	res.setHeader('X-Content-Type-Options', 'nosniff');
	res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
	res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
	next();
});

// SvelteKit handler
app.use(handler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
