// Ported https://github.com/asopinka/bolt-oauth to TypeScript
// and properly called oauth.v2.access method

import { ExpressReceiver } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { URL } from 'url';

const Auth = ({
  clientId,
  clientSecret,
  signingSecret,
  redirectUrl,
  stateCheck,
  onSuccess,
  onError,
}): ExpressReceiver => {
  // param checks
  if (!clientId) {
    throw new Error('clientId is required.');
  }
  if (!clientSecret) {
    throw new Error('clientSecret is required.');
  }
  if (!signingSecret) {
    throw new Error('signingSecret is required.');
  }
  if (!redirectUrl) {
    throw new Error('redirectUrl is required.');
  }
  if (!onSuccess) {
    throw new Error('onSuccess is required.');
  }
  if (typeof onSuccess !== 'function') {
    throw new Error('onSuccess must be a function.');
  }
  if (!onError) {
    throw new Error('onError is required.');
  }
  if (typeof onError !== 'function') {
    throw new Error('onError must be a function.');
  }
  if (!stateCheck) {
    throw new Error('stateCheck is required.');
  }
  if (typeof stateCheck !== 'function') {
    throw new Error('stateCheck is required.');
  }

  // custom receiver
  const receiver = new ExpressReceiver({ signingSecret });

  // the express app
  const expressApp = receiver.app;

  // the oauth callback
  const callbackUrl = new URL(redirectUrl);
  expressApp.get(callbackUrl.pathname, async (req, res) => {
    // do a state check
    const state = req.query.state;
    const stateIsValid = stateCheck(state);

    // if not valid, throw error
    if (!stateIsValid) {
      await onError(new Error('Invalid state.'));
      return;
    }

    // get tokens
    const webClient = new WebClient(null);
    return webClient.oauth.v2
      .access({
        /* eslint-disable @typescript-eslint/camelcase */
        client_id: clientId,
        client_secret: clientSecret,
        code: req.query.code,
        redirect_url: redirectUrl,
        /* eslint-enable */
      })
      .then(async oAuthResult => {
        await onSuccess({ res, oAuthResult });
      })
      .catch(async error => {
        await onError(error);
      });
  });

  return receiver;
};

export default ({
  clientId,
  clientSecret,
  signingSecret,
  redirectUrl,
  stateCheck,
  onSuccess,
  onError,
}): ExpressReceiver => {
  return Auth({ clientId, clientSecret, signingSecret, redirectUrl, stateCheck, onSuccess, onError });
};
