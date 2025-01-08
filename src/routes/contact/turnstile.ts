interface TokenValidateResponse {
  "error-codes": string[];
  success: boolean;
  action: string;
  cdata: string;
}

export const validate_token = async (token: string, secret: string) => {
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        response: token,
        secret: secret
      })
    }
  );

  const data: TokenValidateResponse = await response.json();

  return {
    // Return the status
    success: data.success,

    // Return the first error if it exists
    error: data["error-codes"]?.length ? data["error-codes"][0] : null
  };
};
