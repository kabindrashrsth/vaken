/* eslint-disable */

import { NFCPlugin } from '../../plugins/nfc/client';
import GoogleLogo from '@vandyhacks/google-oauth/logo.svg';
import GitHubLogo from '@vandyhacks/github-oauth/logo.svg';

export const packages = [new NFCPlugin()];
export const authLogos = [
	{ name: 'google', displayName: 'Google', logo: GoogleLogo },
	{ name: 'github', displayName: 'GitHub', logo: GitHubLogo },
];
