import sgMail from "@sendgrid/mail";
import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import {
  CONTACT_EMAIL,
  FROM_EMAIL,
  SENDGRID_API_KEY,
  TURNSTILE_SECRET
} from "$env/static/private";
import { validate_token } from "./turnstile";

export const actions = {
  default: async ({ request }) => {
    sgMail.setApiKey(SENDGRID_API_KEY);

    const data = await request.formData();
    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const subject = data.get("subject") as string;
    const message = data.get("message") as string;
    const company = data.get("company") as string;

    // dumb honeypot
    if (company !== "") {
      return fail(400, { company, invalid: true, text: "Oops! Something went wrong!" });
    }

    const captcha = data.get("cf-turnstile-response") as string;

    console.log(data);
    if (!captcha || typeof captcha !== "string") {
      return fail(400, { captcha, missing: true, text: "Captcha is missing." });
    }

    // validate the captcha
    const { success, error } = await validate_token(captcha, TURNSTILE_SECRET);

    if (!success) {
      console.error(error);
      return fail(406, { error, text: "Captcha validation failed." });
    }

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

    // create a plain text email with all of the fields except the honey-pot
    const text = `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`;
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

    const msg = {
      to: CONTACT_EMAIL,
      from: FROM_EMAIL,
      subject,
      text,
      html
    };
    try {
      await sgMail.send(msg);
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
