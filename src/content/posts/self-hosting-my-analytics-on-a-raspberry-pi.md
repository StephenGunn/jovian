---
title: Self-hosting Umami Analytics on a Raspberry Pi
description:
  Breaking free from expensive analytics platforms by running Umami on a Raspberry Pi with
  Cloudflare tunnels
date: "2025-4-06"
categories:
  - self-hosting
  - analytics
  - raspberry-pi
  - docker
  - umami
published: true
bluesky_thread_id: 3lm6mutx33225
---

## The Analytics Problem

Let's be honest - web analytics is a necessary evil for most website owners. We all want
to understand our traffic patterns, but the available options are... well, they're all
kinda awful:

1. **Google Analytics** - Powerful but invasive, forcing you to add cookie consent banners
   for international users. Plus, yuck.
2. **Commercial alternatives** - Better privacy policies but prohibitively expensive at
   scale.
3. **Self-hosted solutions** - Traditionally complex to set up and maintain.

And don't get me started on performance impacts. Google Analytics has improved somewhat
over the years, but it used to be one of the worst offenders when it comes to slowing down
websites. This problem was so severe that developers created tools like
[Partytown](https://partytown.qwik.dev/) specifically to mitigate the performance impact
of scripts like GA:

> Partytown is a lazy-loaded library to help relocate resource intensive scripts into a
> web worker, and off of the main thread. Its goal is to help speed up sites by dedicating
> the main thread to your code, and offloading third-party scripts to a web worker.

I mean, the fact that we needed to create an entire library just to make Google Analytics
(and other third-party scripts) less terrible for performance tells you everything you
need to know. Even with modern improvements, GA isn't worth it in my opinion.

With my cornucopia of professional projects, hobby projects, family projects, and
experiments, I expect somewhere between 500K and 1M monthly events combined. I found
myself stuck between unacceptable privacy practices, unsustainable costs, and performance
penalties. That's when I turned to self-hosting Umami Analytics on a Raspberry Pi sitting
in my bedroom.

> "In the beginning the Universe was created. This has made a lot of people very angry and
> been widely regarded as a bad move." - Douglas Adams

The same could be said about the creation of Google Analytics.

## Why Self-Host Analytics?

Before diving into the how, let's examine the why - specifically in terms of cost savings
and benefits:

### Commercial Analytics Pricing Comparison

| Service           | Pricing for ~1M monthly events   |
| ----------------- | -------------------------------- |
| Vercel Analytics  | $140/month ($14 per 100K events) |
| Fathom Analytics  | $60/month                        |
| Umami Cloud       | $20/month ($0.00002 per event)   |
| Self-hosted Umami | ~$0.58/month electricity cost    |

The cost savings are substantial. Even compared to Umami's own cloud service (which is
already reasonably priced), I'm saving approximately $232 annually by self-hosting.

But beyond cost, Umami has another huge advantage: it's incredibly lightweight. The script
is just ~5KB (compared to Google Analytics at 45KB+), non-blocking, and doesn't use
cookies. My Core Web Vitals scores remained virtually untouched after adding Umami, which
was a pleasant surprise after years of fighting with bloated analytics scripts.

## Hardware

Here's what I'm using:

- Raspberry Pi 4B with 8GB RAM
- 64GB microSD card
- Standard Raspberry Pi power supply
- Ubuntu Server OS
- Symmetrical 1Gbps fiber internet connection

The total power consumption costs me around $7 per year. In my case, I had a Raspberry Pi
gathering dust from a previously failed project (we don't talk about that), so this was an
excellent way to put it back to work. If you need to purchase one, you'll still break even
compared to commercial options within a few months.

## Setting Up Umami on the Raspberry Pi

> "The trouble with having an open mind, of course, is that people will insist on coming
> along and trying to put things in it." - Terry Pratchett

The same goes for Raspberry Pis - once you have one, you'll keep finding new things to run
on it. My setup uses Docker to simplify deployment and maintenance. Here's how I have it
configured (or at least how I think I configured it... it's been a while, and I didn't
document it well at the time):

### Setting Up Umami with Docker

I installed Docker on my Raspberry Pi using their convenient shell script:

```bash
curl -sSL https://get.docker.com | sh
```

This script automatically detects and installs everything needed to run Docker on the
Raspberry Pi. Then I installed Docker Compose to manage multi-container applications.

For Umami itself, I used Docker Compose to set up the application. The Umami project
maintains detailed installation instructions that I recommend following, as the specifics
may change over time:

[Umami Installation Documentation](https://umami.is/docs/install)

The general approach I took was:

1. Set up Docker and Docker Compose on the Raspberry Pi
2. Create a `docker-compose.yml` file based on Umami's recommendations
3. Launch the application with `docker-compose up -d`

By default, this makes Umami accessible on port 3000 with the default admin credentials.

## Connecting to an External Database

While the Raspberry Pi can run PostgreSQL perfectly well, I eventually decided to connect
Umami to my existing Digital Ocean PostgreSQL database. This provides two advantages:

1. Reduced load on the Raspberry Pi
2. Easier migration if I ever need to move Umami elsewhere

To configure this, I modified the `DATABASE_URL` in my Docker Compose file:

```yaml
environment:
  DATABASE_URL: postgresql://username:password@db.mydigitalocean.com:5432/umami
  DATABASE_TYPE: postgresql
  HASH_SALT: some-random-string
```

Using the Digital Ocean managed database service means I don't have to worry about
database backups, as Digital Ocean handles that automatically. This gave me peace of mind
knowing my analytics data would be safe even if something happened to the Pi. With
symmetrical 1GB fiber and solid home networking, I'm comfortable hosting services at home
while keeping critical data in the cloud.

## Making It Accessible with Cloudflare Tunnels

With Umami running on my Raspberry Pi, I needed a secure way to access it from the
internet without exposing my home IP address or maintaining dynamic DNS. Cloudflare
Tunnels provides the perfect solution.

### 1. Install Cloudflared

First, install the Cloudflare Tunnel client:

```bash
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
sudo dpkg -i cloudflared.deb
```

### 2. Authenticate with Cloudflare

```bash
cloudflared tunnel login
```

This will open a browser where you'll authenticate with your Cloudflare account. If you're
doing this on a headless server like I was, you'll get a URL to open in a browser on
another device. Copy that URL, open it in your browser, authenticate, and you're good to
go. It's kind of magical how smoothly this process works.

### 3. Create a Tunnel

```bash
cloudflared tunnel create umami-analytics
```

Note the Tunnel ID that's generated. Save this somewhere safe (unlike me, who had to dig
through command history to find it again later).

### 4. Configure the Tunnel

Create a configuration file at `~/.cloudflared/config.yml`:

```yaml
tunnel: your-tunnel-id-here
credentials-file: /home/pi/.cloudflared/your-tunnel-id-here.json

ingress:
  - hostname: analytics.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

### 5. Create DNS Records

You can create the DNS records either via the command line:

```bash
cloudflared tunnel route dns your-tunnel-id-here analytics.yourdomain.com
```

Or directly from the Cloudflare dashboard, which is what I ended up doing since it was
easier to manage all my DNS records in one place. Just add a CNAME record pointing to your
tunnel URL.

### 6. Run the Tunnel as a Service

```bash
sudo cloudflared service install
```

This creates a systemd service that will automatically start when your Raspberry Pi boots
up. Now your analytics are accessible at analytics.yourdomain.com without exposing your
home network to the scary internet.

## Monitoring and Maintenance

> "I'm sorry, Dave. I'm afraid I can't do that." - HAL 9000

Thankfully, my Raspberry Pi is much more cooperative than HAL. One concern with
self-hosting is keeping the system healthy and resilient. I use a simple monitoring
approach:

1. **Health checks** - Built into my Docker Compose setup
2. **Automatic restarts** - Using Docker's restart policy
3. **System monitoring** - Simple cron jobs that email me if disk space runs low

The great thing about this setup is its resilience. I've accidentally unplugged the Pi
before, and upon plugging it back in, it booted right up and all services resumed
automatically thanks to Docker's restart policies and the Cloudflare tunnel service.

As for database backups, I don't need to worry about setting up custom cron jobs since
Digital Ocean's managed PostgreSQL handles this for me. This is another advantage of using
cloud database services with self-hosted applications – you get the best of both worlds.

## Performance Considerations

My Raspberry Pi 4B with 8GB RAM handles the workload comfortably, even with peaks of
around 50-60K events per day. If you're running multiple services on your Pi, you may want
to adjust the resource limits in your Docker Compose file:

```yaml
services:
  umami:
    # ...existing configuration...
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 1G
```

## In Conclusion

Self-hosting Umami Analytics on a Raspberry Pi has been a win on multiple fronts:

1. **Cost savings** - I'm saving over $230 annually compared to cloud solutions (that's
   like, 46 coffees)
2. **Privacy control** - No third parties involved in data collection
3. **Learning opportunity** - Expanded my knowledge of Docker, Cloudflare, and Linux
4. **No cookie banners needed** - Since I control the data and it's privacy-focused
5. **Unlimited (in theory) scale** - No artificial limits on tracked events

While this setup may not be for everyone, it's perfect for small to medium-sized sites
that want analytics without the cookie consent burden or subscription costs. The entire
setup took about an afternoon (plus another hour of debugging weird network issues, and
then another hour the next day when I realized I'd forgotten something basic).

> "Any sufficiently advanced technology is indistinguishable from magic." - Arthur C.
> Clarke

It's incredibly rewarding to have this tiny computer in my bedroom silently tracking
website visits from around the world. It's not perfect, and occasionally I need to SSH in
and restart things, but that's part of the charm of self-hosting. I've come to appreciate
the little blinking lights on my Pi as a sign that things are working as they should.

Is it worth it? Absolutely. The satisfaction of building something useful with your own
hands, combined with the substantial cost savings, makes this a rewarding project.
Self-hosting may be a small adventure, but it comes with both practical benefits and the
personal satisfaction of running your own infrastructure.

Thanks for reading! Feel free to reach out if you build something similar or have
questions about the setup. I probably won't remember exactly how I did everything, but
I'll try my best to help. Or at least I'll commiserate with you about your own weird
Docker issues.
