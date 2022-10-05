import auth0 from 'auth0-js';

export const encodeRedirectUri = (email: string, fingerprint: string) => {
  return btoa(
    unescape(encodeURIComponent(JSON.stringify({ email, fingerprint })))
  );
};

export const webAuth = new auth0.WebAuth({
  domain: process.env.AUTH0_DOMAIN,
  clientID: process.env.AUTH0_CLIENT_ID,
  responseType: 'token id_token',
});
