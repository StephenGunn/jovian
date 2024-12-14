---
title: Enhancing HTML Form Validation with Svelte 5
description: |
  Building on the browser’s built-in form validation, Svelte 5 can enrich the user
  experience with custom validation and feedback.
date: "2024-12-13"
categories:
  - sveltekit
  - svelte
  - html
published: true
bluesky_thread_id: "3ldakmu65y22c"
---

<script>
    import CssInvalid from '$lib/components/blog/CssInvalid.svelte';
    import CssUserInvalid from '$lib/components/blog/CssUserInvalid.svelte';
    import SampleLoginForm from '$lib/components/blog/SampleLoginForm.svelte';
</script>

## Did you know about the browser’s built-in form validation?

If you’re reading this, I’m confident you already do. It’s really cool. You can add
`required`, `minlength`, `maxlength`, `pattern`, and `type` attributes to your form
inputs, and the browser will handle the validation for you. If you’ve ever tried to submit
a form with a required field empty, you’ve seen the browser’s built-in validation in
action.

Browser form validation has evolved significantly. In the past, I’ve bent over backward
creating custom validation systems. Many developers still do, but the browser’s built-in
validation can take you a long way with just a few HTML attributes.

## A Small Downside (I.M.H.O.)

This is my personal take, but requiring the user to submit the form before seeing
validation feedback can feel counterintuitive. If the form is long, it’s frustrating. If
many fields are invalid at once, the sudden burst of feedback can be overwhelming.

## Is There Anything We Can Do?

Absolutely! You can alert the user via CSS and JavaScript before the form is submitted.
Depending on your form’s complexity and the experience you’re aiming for, you might want
to enhance the browser’s built-in validation.

Let’s start with CSS before diving into Svelte.

## Using CSS `:invalid` and `:user-invalid`

Modern browsers provide a pseudo-class `:invalid` that styles form inputs when their
values don’t meet specified criteria (e.g., empty when `required`, too short compared to
`minlength`, or not matching a `pattern`).

For example:

```html
<input type="email" required aria-required="true" />
```

```css
input:invalid {
  border: 3px solid red;
}
```

<CssInvalid />

Notice that the input starts out invalid (red border) because it’s required and currently
empty. Once you start typing, the border resets to the default style.

While `:invalid` gives instant feedback, it applies as soon as the input is loaded. If
you’d like this to happen only after user interaction, you can try `:user-invalid` where
supported:

```css
input:user-invalid {
  border: 3px solid red;
}
```

<CssUserInvalid />

The `:user-invalid` pseudo-class might not be fully supported across all browsers, but it
aims to provide a more user-friendly experience by showing invalid states only after user
interaction. Either way, you can give immediate visual cues as users type, rather than
waiting until they submit the form.

`:user-invalid` is a great concept, but it’s limited to styling. To go beyond simple
visuals, we’ll need JavaScript (TypeScript, in my case) and Svelte.

> **Note:** The `:user-invalid` pseudo-class is part of the CSS Pseudo-Classes Level 4 and
> not yet widely supported. It’s a great concept, but you might need to rely on JavaScript
> for more complex interactions.

## Enhancing the User Experience with Svelte

While this isn't necessary for a lot of forms, there might be a time where you want to
listen to the validity state of a form field to provide immediate or more explicit
feedback to the user. Svelte's reactivity makes this a breeze.

Rather than writing two layers of validation (one in HTML, another in JavaScript), we can
leverage the browser’s built-in validation states directly. With Svelte 5, you can harness
reactive state to deliver immediate, dynamic feedback.

## A Simple Example with a Login Form

Check out this simple example of a login form where we can provide immediate feedback to
the user based on the validity of the email and password fields.

<SampleLoginForm />

Obviously this example is a bit contrived, but I wanted the example to be very obvious.

## How Does It Work?

Surprisingly, it doesn’t require much JavaScript. The form will still work without
JavaScript enabled—we’re building on the browser’s native validation.

Every form input element in HTML5 comes with a `validity` property. This property is an
instance of the
[`ValidityState`](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState)
interface, which provides boolean properties indicating the validity of the input based on
various criteria.

For an input with `type="email"`, the browser checks whether the entered value conforms to
the standard email format. The `valid` property of the `validity` object will be `true` if
the input matches the email format and `false` otherwise.

The validity is based off of the input's `type`, `required`, `minlength`, `maxlength`, and
`pattern` attributes.

## My Svelte 5 Code

```svelte:Login.svelte
<script lang="ts">
  import Confetti from "svelte-confetti";
  import Check from "phosphor-svelte/lib/Check";
  import X from "phosphor-svelte/lib/X";

  let email_valid = $state(false);
  let password_valid = $state(false);
  let confetti = $state(false);
  let disabled = $derived(!email_valid || !password_valid);
</script>

<div class="comp">
  <form
    onsubmit={(e) => {
      e.preventDefault();
      if (disabled) return;
      confetti = true;
      setTimeout(() => {
        confetti = false;
      }, 2000);
    }}
  >
    <label for="email" class:valid={email_valid}>Email</label>
    <div class="relative">
      <input
        type="email"
        name="email"
        id="email"
        placeholder="Add an email address"
        required
        aria-required="true"
        oninput={(e: Event) => {
          const target = e.target as HTMLInputElement;
          email_valid = target?.validity?.valid || false;
        }}
      />
      <div class="icon">
        {#if email_valid}
          <Check size="1.5rem" color="var(--secondary)" />
          <div class="confetti">
            <Confetti />
          </div>
        {:else}
          <X size="1.5rem" color="var(--accent)" />
        {/if}
      </div>
    </div>

    <label for="password" class:valid={password_valid}>Password</label>
    <div class="relative">
      <input
        type="password"
        name="password"
        id="password"
        minlength="8"
        placeholder="Add a password (min 8 characters)"
        required
        aria-required="true"
        oninput={(e: Event) => {
          const target = e.target as HTMLInputElement;
          password_valid = target?.validity?.valid || false;
        }}
      />
      <div class="icon">
        {#if password_valid}
          <Check size="1.5rem" color="var(--secondary)" />
          <div class="confetti">
            <Confetti />
          </div>
        {:else}
          <X size="1.5rem" color="var(--accent)" />
        {/if}
      </div>
    </div>
    <button disabled={confetti}>
      Login
      {#if confetti}
        <div class="confetti">
          <Confetti />
        </div>
      {/if}
    </button>
  </form>
</div>

<style>
  .relative {
    position: relative;
  }

  .icon {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
  }
  .comp {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    gap: 1.5rem;
    border-radius: 1rem;
    border: 1px solid var(--bg-accent-1);
  }
  form {
    display: flex;
    flex-flow: column;
    max-width: 400px;
  }
  label:not(:first-child) {
    margin-top: 1rem;
  }
  label {
    color: var(--accent);
  }
  label.valid {
    color: var(--secondary);
  }
  input {
    margin: 0;
    padding: 0.5rem 1rem;
  }

  button {
    margin-top: 1rem;
    position: relative;
  }

  button .confetti {
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 100%;
    left: 50%;
  }

  button:disabled {
    background-color: var(--bg-accent-3);
    color: var(--bg);
    cursor: not-allowed;
  }
</style>
```

There isn’t much Svelte code here. The key part is:

```svelte
oninput={(e: Event) => {
  const target = e.target as HTMLInputElement;
  email_valid = target?.validity?.valid || false;
}}
```

Try it out yourself in the
[Svelte playground](https://svelte.dev/playground/034205c491b747cd92865751b5cd002d?version=5.13.0).
Granted, there are some small changes to the code but the idea is the same.

## Server-Side Validation

While the browser’s built-in validation is great for immediate feedback, it’s not a silver
bullet. You should always validate user input on the server side to ensure data integrity
and security. Using [SvelteKit's Form Actions](https://svelte.dev/docs/kit/form-actions)
is a great way to handle server-side form submission and security.

## Conclusion

Svelte 5 makes it easy to enhance the user experience without reinventing the wheel. The
browser already handles validation—use it! With Svelte, you can provide a friendlier, more
interactive experience without duplicating a ton of validation logic.

These kinds of enhancements are everywhere, and Svelte is a fantastic tool to make them
more accessible.

Let me know what you think in the discussion on BlueSky.
