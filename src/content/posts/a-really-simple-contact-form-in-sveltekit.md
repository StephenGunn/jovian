---
title: A Really Simple Contact Form in SvelteKit using Form Actions
description:
  If you need a contact form for your SvelteKit site, this is a simple example using Form
  Actions.
date: "2024-11-12"
categories:
  - sveltekit
  - svelte
  - typescript
  - svelte 5
published: true
---

## Overview

This is less of a tutorial and more of a resource to help you get started with a simple
contact form in SvelteKit. This is based on the code that runs this site, uses Form
Actions to handle the form submission, and includes a very simple honeypot spam prevention
technique.

If you were to use this on a production site, you would eventually want to add more robust
spam prevention using something like Cloudflare Turnstile or Google reCAPTCHA.

## The Svelte Component

```svelte:contact/+page.svelte
<script lang="ts">
  import { enhance } from "$app/forms";
  import { dev } from "$app/environment";

  let submitting = false;
  let completed = false;
  let error = "";
</script>

<h1>Contact</h1>
<p>Use the contact form below to get in touch with me.</p>

{#if completed}
  <p>Thank you for your message. I'll get back to you as soon as possible.</p>
{:else}
  <form
    method="post"
    use:enhance={() => {
      submitting = true;
      error = "";
      return async ({ result }) => {
        submitting = false;
        if (result.type === "failure" && result.data) {
          error = result.data.text as string;
        } else if (result.type === "success") {
          completed = true;
        }
      };
    }}
  >
    <label for="name">Name</label>
    <input type="text" id="name" name="name" required />

    <label for="email">Email</label>
    <input type="email" id="email" name="email" required />

    <label for="subject">Subject</label>
    <input type="text" id="subject" name="subject" required />

    <label for="message">Message</label>
    <textarea id="message" name="message" rows="5" minlength="10" maxlength="750" required
    ></textarea>

    <input type="text" name="company" style="display: none" />

    <button type="submit">
      {#if submitting}Submitting...{:else}Submit{/if}
    </button>
  </form>
{/if}
```

## The Form Action

```typescript:contact/+page.server.ts
import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { CONTACT_EMAIL, FROM_EMAIL } from "$env/static/private";

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const subject = data.get("subject") as string;
    const message = data.get("message") as string;
    const company = data.get("company") as string;

    // honeypot check
    if (company !== "") {
      return fail(400, { company, invalid: true, text: "Oops! Something went wrong!" });
    }

    // purposely verbose error messages
    if (!name) {
      return fail(400, { name, missing: true, text: "Name is missing." });
    }
    if (!email) {
      return fail(400, { email, missing: true, text: "Email is missing." });
    }
    if (!subject) {
      return fail(400, { subject, missing: true, text: "Subject is missing." });
    }
    if (!message) {
      return fail(400, { message, missing: true, text: "Message is missing." });
    }

    // create a plain text email with all of the fields except the honeypot
    const text = `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`;

    // create an HTML email with all of the fields except the honeypot
    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .container {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        td {
            background-color: #fafafa;
        }
    </style>
</head>
<body>
    <div class="container">
        <table>
            <tr>
                <th>Name</th>
                <td>${name}</td>
            </tr>
            <tr>
                <th>Email</th>
                <td>${email}</td>
            </tr>
            <tr>
                <th>Subject</th>
                <td>${subject}</td>
            </tr>
            <tr>
                <th>Message</th>
                <td style="white-space: pre-wrap;">${message}</td>
            </tr>
        </table>
    </div>
</body>
</html>
`;

    // create a message object that works with SendGrid
    const msg = {
      to: CONTACT_EMAIL,
      from: FROM_EMAIL,
      subject,
      text,
      html
    };

    try {
      await your_send_mail_function(msg);
    } catch (error) {
      console.error(error);
      return fail(500, { message: error });
    }

    return {
      status: 200,
      body: {
        message: "Email sent successfully"
      }
    };
  }
} satisfies Actions;
```

## A Few Notes

This example obviously doesn't include a method to send the email from the server. I use
[SendGrid](https://sendgrid.com) for this site, but you could use any email service you
like. Just replace `your_send_mail_function` with your own function that sends the email.

The `FROM_EMAIL` and `CONTACT_EMAIL` are environment variables that I have set in my
`.env` file. You can replace these with your own email addresses. If you use a service
like SendGrid, you will need to use the email address that you have verified with them.

## Conclusion

I plan on writing some more articles about how to create email-friendly templates directly
in SvelteKit and other related things. If you have any questions or suggestions, feel free
to reach out.

Hope this helps!
