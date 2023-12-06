import {BindingScope, injectable,bind} from '@loopback/core';
import * as msal from '@azure/msal-node';
// import { AuthInfo } from '../types'; // This would be a custom type representing the auth info
import {authConfig} from '../authConfig'; // Assuming you have an authConfig file

@bind({scope: BindingScope.TRANSIENT})
export class MsalService {

  private msalClient: msal.ConfidentialClientApplication;

  constructor() {
    // Initialize MSAL client here
    const msalConfig = {
      auth: {
        clientId: authConfig.credentials.clientID,
        authority: `https://${authConfig.metadata.authority}/${authConfig.credentials.tenantID}`,
        clientSecret: authConfig.credentials.clientSecret,
        clientCapabilities: ['CP1'],
        system: {
          loggerOptions: {
            piiLoggingEnabled: false,
            logLevel: msal.LogLevel.Info,
          },
        },
      },
    };
    this.msalClient = new msal.ConfidentialClientApplication(msalConfig);
  }

  async getOboToken(tokenValue: string): Promise<string> {
    // Logic to acquire OBO token
    // Example:
    const oboRequest = {
      oboAssertion: tokenValue,
      scopes: ['user.read'], // Update with your required scopes
    };
    const response = await this.msalClient.acquireTokenOnBehalfOf(oboRequest);
    return response!.accessToken;
  }

  // isAppOnlyToken(authInfo: AuthInfo): boolean {
  //   // Logic to determine if the token is an app-only token
  //   // Example check based on authInfo content
  //   return authInfo.isAppOnlyToken;
  // }

  isAppOnlyToken(accessTokenPayload: any): boolean {
    if (!accessTokenPayload.hasOwnProperty('idtyp')) {
      if (accessTokenPayload.hasOwnProperty('scp')) {
        return false;
      } else if (
        !accessTokenPayload.hasOwnProperty('scp') &&
        accessTokenPayload.hasOwnProperty('roles')
      ) {
        return true;
      }
    }

    return accessTokenPayload.idtyp === 'app';
  }

  // hasRequiredDelegatedPermissions(authInfo: AuthInfo, requiredScopes: string[]): boolean {
  //   // Logic to check if delegated permissions are sufficient
  //   // Example check based on authInfo content
  //   return requiredScopes.every(scope => authInfo.scopes.includes(scope));
  // }

  hasRequiredDelegatedPermissions(
    accessTokenPayload: any,
    requiredPermission: string[],
  ): boolean {
    const normalizedRequiredPermissions = requiredPermission.map(permission =>
      permission.toUpperCase(),
    );

    if (
      accessTokenPayload.hasOwnProperty('scp') &&
      accessTokenPayload.scp.split(' ').some((claim: string) =>
        normalizedRequiredPermissions.includes(claim.toUpperCase()),
      )
    ) {
      return true;
    }

    return false;
  }

}

