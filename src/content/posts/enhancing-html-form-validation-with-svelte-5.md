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

## Enhancing the User Experience with Svelte

Imagine a login form that requires a valid email and a password of at least 8 characters.
Sure, `:user-invalid` can handle basic feedback, but what if you want to prevent
submission until the inputs are valid? Or provide more detailed feedback?

Rather than writing two layers of validation (one in HTML, another in JavaScript), we can
leverage the browser’s built-in validation states directly. With Svelte 5, you can harness
reactive state to deliver immediate, dynamic feedback.

## The Svelte 5 Example

Check out this example. It won’t let you submit until both the email and password fields
are valid. Enter an invalid email and a too-short password, and you’ll see instant
feedback.

<SampleLoginForm />

## How Does It Work?

Surprisingly, it doesn’t require much JavaScript. The form will still work without
JavaScript enabled—we’re building on the browser’s native validation.

JavaScript gives us access to the form field’s `validity` state. Combined with Svelte’s
reactivity, you get instant visual feedback and can prevent form submission until fields
are valid.

## Svelte 5 Example

```svelte
<script lang="ts">
  let email_valid = $state(false);
  let password_valid = $state(false);
  let disabled = $derived(!email_valid || !password_valid);
</script>

<form>
  <label for="email">Email</label>
  <input
    type="email"
    name="email"
    id="email"
    required
    aria-required="true"
    oninput={(e: Event) => {
      const target = e.target as HTMLInputElement;
      email_valid = target?.validity?.valid || false;
    }}
  />

  <label for="password">Password</label>
  <input
    type="password"
    name="password"
    id="password"
    minlength="8"
    required
    aria-required="true"
    oninput={(e: Event) => {
      const target = e.target as HTMLInputElement;
      password_valid = target?.validity?.valid || false;
    }}
  />
  <button {disabled}>Login</button>
</form>

<style>
  form {
    display: flex;
    flex-flow: column;
    max-width: 400px;
  }

  input {
    margin-bottom: 1rem;
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

We’re simply listening for `input` events, accessing the `validity` property, and updating
our reactive variables that live in `$state()`. The type of validation performed depends
on the input’s `type`. For example, `type="email"` tells the browser to validate the input
as an email address.

Try it out yourself in the
[Svelte playground](https://svelte.dev/playground/b06268bdf82643e096fe57bb3fe583c9?version=5.12.0).

## Conclusion

Svelte 5 makes it easy to enhance the user experience without reinventing the wheel. The
browser already handles validation—use it! With Svelte, you can provide a friendlier, more
interactive experience without duplicating a ton of validation logic.

These kinds of enhancements are everywhere, and Svelte is a fantastic tool to make them
more accessible.

Let me know what you think in the discussion on BlueSky.
