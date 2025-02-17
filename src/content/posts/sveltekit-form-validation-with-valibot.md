---
title: SvelteKit form validation with Valibot
description:
  Creating a formData extraction system that relies on Valibot schemas for simple
  validation
date: "2025-2-16"
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
export const RegistrationSchema = v.object({
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
  ),
  v.check((i) => i.confirm_password === i.password, 'Passwords dont match'),
});

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
export const actions = {
  register: async ({ request, cookies }) => {
    // process the incoming form data, validate against valibot schema and extract values
    const { data, error } = await extract_form_data<RegistrationForm>(
      request,
      RegistrationSchema
    );
    // check for error or lack of data, checking for !data will make typescript happy
    if (error || !data) {
      console.error(error);
      return fail(500, { error });
    }

    try {
      const user_data = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
      };

      const new_user = await create_user(user_data);

      return {
        success: true,
        message: "User created successfully",
        email: new_user.email
      };
    } catch (error) {
      console.log("error", error);
      if (user_exists(error)) {
        return fail(409, { message: "User already exists with this email address." });
      }

      const message =
        error.errors[0]?.message || "An unknown error occurred, please contact support.";
      return fail(500, { message });
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

## In Conclusion

This approach makes handling form data in SvelteKit both safer and more maintainable. The
combination of frontend validation, strong typing, and systematic backend validation
creates multiple layers of protection against invalid data. Plus, the reusable nature of
the `extract_form_data` function means you can drop this pattern into any form handling
needs you have.

You could extend this further by adding custom validators, creating more complex nested
schemas, or even building a library of common validation patterns for your project.

Thanks for reading! Feel free to reach out on BlueSky if you build something interesting
with this pattern.
