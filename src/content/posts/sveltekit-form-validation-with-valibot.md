---
title: SvelteKit form validation with Valibot
description:
  Creating a formData extraction system that relies on Valibot schemas for simple
  validation
date: "2025-2-16"
updated: "2025-2-25"
categories:
  - sveltekit
  - valibot
  - formactions
  - typescript
bluesky_thread_id: "3lictjjpgd22v"
published: true
---

## SvelteKit & Forms

So you have a [SvelteKit](https://svelte.dev/) site, the chances are that you're also
going to have a lot of forms. The chances are also that you're going to want to validate
the data of the incoming formData to prevent erronious submissions. There is also a good
chance that you want strong typing via [TypeScript](https://www.typescriptlang.org/) to
ensure that everything is correct after you get the data.

We can achieve all of this in a clean, repeatable manner.

> "Hold onto your butts" - Ray Arnold (Jurassic Park)

I'll be examining how I achieve this by breaking down a user registration flow, but I need
to cover a few things first.

## Validation on the Frontend

Form validation can take place in multiple places, and it should. Browsers have fantastic
methods to validate input on the frontend before the data is even submitted. But this blog
post isn't about that- however, I do have a blog post about
[Enhancing HTML Form Validation with Svelte 5](/posts/enhancing-html-form-validation-with-svelte-5)
that touches this topic.

You should be validating input on the frontend, but you should also be validating data on
the backend. Defense in depth is key when handling user input.

## Valibot vs Zod

In the grand scheme of things, [Valibot](https://valibot.dev/) is the new kid on the
block. [Zod](https://zod.dev/) has been an established player in the data validation space
for a while. The reason why I've adopted Valibot is because of it's modular architecture
and treeshakability. It's faster and will ultimately result in a smaller bundle size.

If you prefer Zod, these principles still apply - just swap out Valibot for Zod in the
examples.

## Simple Valibot Schemas

Valibot can do a lot. I have some more complicated data validation schemas that I work
with but I am going to keep this example extremely simple. It's simple, but still very
powerful.

Let's look at a schema that validates a basic registration form with first name, last
name, email, and password fields - each with their own validation rules. I removed my
custom regex validator to make it a little more clear for the unititiated.

```typescript:types/forms.ts
export const RegistrationSchema = v.pipe(
  v.object({
    first_name: v.pipe(
      v.string("You must enter a first name."),
      v.nonEmpty("First name is required.")
    ),
    last_name: v.pipe(
      v.string("You must enter a last name."),
      v.nonEmpty("Last name is required.")
    ),
    email: v.pipe(
      v.string("You must enter an email address."),
      v.nonEmpty("Invalid email address."),
      v.email("Email address is required.")
    ),
    password: v.pipe(
      v.string("You must enter a password."),
      v.nonEmpty("Password is required."),
      v.minLength(8, "Password must be at least 8 characters.")
    ),
    confirm_password: v.pipe(
      v.string("You must confirm your password."),
      v.nonEmpty("Confirm password is required."),
      v.minLength(8, "Confirm password must be at least 8 characters.")
    )
  }),
  v.check((i) => i.confirm_password === i.password, "Passwords dont match")
);

export type RegistrationForm = v.InferInput<typeof RegistrationSchema>;
```

As you can see, I export both the Schema and the Type. The type is generated from the
schema using Valibots `v.InferInput` function and results in this type:

```typescript
type RegistrationForm = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
};
```

## The SvelteKit Form Action

Let's take a look at the action that handles the form data. I have removed most of the
business logic so we can concentrate on the important parts.

```typescript:register/+page.server.ts
import type { Actions } from './$types';
import { RegistrationSchema } from '$lib/types/data/forms';
import { dev } from '$app/environment';
import { config } from '$lib/config/general';
import { fail, redirect } from '@sveltejs/kit';
import { passwordStrength } from 'check-password-strength';
import { password_options } from '$lib/config/password_verification';
import { extract_form_data } from '$lib/utils/extract_form_data';

export const load = (async ({ url, locals }) => {
  // if the user is logged in, log them out and bring them back here
  const { approved } = auth_check({
    locals,
    url,
    required_roles: ['admin', 'authorized']
  });

  if (approved) {
    return redirect(303, '/logout?return=/create-account');
  }
}) satisfies PageServerLoad;

export const actions = {
  register: async ({ request, cookies }) => {
    // process the incoming form data, validate against valibot schema and extract values
    const { data, error } = await extract_form_data(request, RegistrationSchema);
    if (error || !data) {
      console.error(error);
      return fail(500, { error });
    }

    // redundant password check
    if (data.password !== data.confirm_password) {
      return fail(400, { message: 'Passwords do not match' });
    }

    // serverside password validation check
    const is_valid_password = passwordStrength(data.password, password_options).id === 3;
    if (!is_valid_password) {
      return fail(400, { message: 'Password is too weak' });
    }

    try {
      const user_data = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        role: 'unverified',
      };

      const new_user = await createUser(user_data);

      // make sure we have a valid user object
      if (new_user?.id && new_user?.email) {
        set_email_verification_cookie(cookies, new_user.email);
        return { success: true, message: 'User created successfully', email: new_user.email };
      }

      return fail(500, {
        message: 'Unexpected error occurred during registration, please contact support.'
      });
    } catch (error) {
        console.error('error', error);
        return fail(500, { error }); // this is an approximation
      } else {
        // Handle any other types of errors
        return fail(500, {
          message: 'Unexpected error occurred during login, please contact support.'
        });
      }
    }
  }
} satisfies Actions;
```

If you've hand-rolled your own SvelteKit form actions, you'll notice that I am not doing
the standard `const data = await request.formData()` that normally takes place. That's
because I've rolled my formData extraction and Valibot validation into a reusable function
that returns a fully typed object, or an error as a value.

I can do this by using generic types and passing the Valibot schema for the expected
formData as an argument. This makes the function easily reusable across my project.

Let's take a look at my `extract_form_data()` function:

```typescript:extract_form_data.ts
import { dev } from "$app/environment";
import * as v from "valibot";

export const extract_form_data = async <T>(
  request: Request,
  schema: v.GenericSchema<T>
): Promise<{
  data: T | undefined;
  error: string | null;
}> => {
  try {
    const formData = await request.formData();
    const result: Record<string, any> = {};

    // Convert form data to an object with proper handling of multiple values
    formData.forEach((value, key) => {
      // Case 1: First time encountering this key
      if (result[key] === undefined) {
        result[key] = value;
      }

      // Case 2: Key exists and is already an array, add new value
      else if (Array.isArray(result[key])) {
        result[key].push(value);
      }

      // Case 3: Key exists but isn't an array yet, convert to array with both values
      else {
        result[key] = [result[key], value];
      }
    });

    const validation = v.safeParse(schema, result);

    if (!validation.success) {
      // Some extra dev logging that helps with debugging
      if (dev) {
        console.error("Validation errors:");
        for (const error of validation.issues) {
          console.error(`- ${error.message}`);
        }
      }

      if (validation.issues && validation.issues.length > 0) {
        return {
          data: undefined,
          error: validation.issues.map((issue) => issue.message).join(", ")
        };
      }

      return {
        data: undefined,
        error: "Error validating form submission, please check everything carefully."
      };
    }

    return { data: validation.output, error: null };
  } catch (error) {
    if (dev && config.verbose_formaction_logging) {
      console.error(`Error extracting form data: ${error}`);
    }
    return { data: undefined, error: `Error extracting form data: ${error}` };
  }
};
```

> note: The reason you have to pass the type with the schema, instead of deriving the type
> inside of the function, is because the `schema: v.GenericSchema<T>` argument expects a
> genertic type to function correctly.

I added some extra and perhaps redundant comments to the code to try and explain what
everything does. If there is a validation error from Valibot, I will return it's value to
be used in SvelteKit's `fail` function to the frontend. The chances of this happening are
kind of low, since I am also validating input - but it does happen.

The data returned, if successful will be fully typed based on the schema. Which makes
working with the data more fun.

## UPDATED: Improved Type Inference

**Update (February 25, 2025):** After some experimentation, I've found a way to improve
the `extract_form_data` function to eliminate the need to pass the type parameter
explicitly.

Here's the updated version:

```typescript:extract_form_data.ts
import { dev } from "$app/environment";
import * as v from "valibot";

export const extract_form_data = async <
  TInput = unknown,
  TOutput = TInput
>(
  request: Request,
  schema: v.BaseSchema<TInput, TOutput, v.BaseIssue<unknown>>
): Promise<{
  data: TOutput | undefined;
  error: string | null;
}> => {
  try {
    const formData = await request.formData();
    const result: Record<string, any> = {};

    // Convert form data to an object with proper handling of multiple values
    formData.forEach((value, key) => {
      // Case 1: First time encountering this key
      if (result[key] === undefined) {
        result[key] = value;
      }
      // Case 2: Key exists and is already an array, add new value
      else if (Array.isArray(result[key])) {
        result[key].push(value);
      }
      // Case 3: Key exists but isn't an array yet, convert to array with both values
      else {
        result[key] = [result[key], value];
      }
    });

    const validation = v.safeParse(schema, result);
    if (!validation.success) {
      if (dev) {
        console.error('Validation errors:');
        for (const error of validation.issues) {
          console.error(`- ${error.message}`);
        }
      }
      if (validation.issues && validation.issues.length > 0) {
        return {
          data: undefined,
          error: validation.issues.map((issue) => issue.message).join(', ')
        };
      }
      return {
        data: undefined,
        error: 'Error validating form submission, please check everything carefully.'
      };
    }

    return { data: validation.output as TOutput, error: null };
  } catch (error) {
    if (dev && config.verbose_formaction_logging) {
      console.error(`Error extracting form data: ${error}`);
    }
    return { data: undefined, error: `Error extracting form data: ${error}` };
  }
};
```

With this change, we now use the more specific `BaseSchema` type with its three type
parameters, allowing TypeScript to automatically infer the output type from the schema
itself. This means you can now call the function like this:

```typescript
const { data, error } = await extract_form_data(request, RegistrationSchema);
```

TypeScript will automatically know that `data` is of type `RegistrationForm` without you
having to specify it explicitly.

The key differences are:

1. We're now using `BaseSchema<TInput, TOutput, v.BaseIssue<unknown>>` instead of
   `GenericSchema<T>`
2. We've removed the need to pass the type as a generic parameter
3. TypeScript can infer the return type automatically from the schema

## In Conclusion

This approach makes handling form data in SvelteKit both safer and more maintainable. The
combination of frontend validation, strong typing, and systematic backend validation
creates multiple layers of protection against invalid data. Plus, the reusable nature of
the `extract_form_data` function means you can drop this pattern into any form handling
needs you have.

You could extend this further by adding custom validators, creating more complex nested
schemas, or even building a library of common validation patterns for your project.

With the recent update to improve type inference, the API is now even more ergonomic while
maintaining all the safety benefits.

Thanks for reading! Feel free to reach out on BlueSky if you build something interesting
with this pattern.
