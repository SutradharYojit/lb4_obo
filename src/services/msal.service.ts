import {BindingScope, injectable, bind} from '@loopback/core';
import * as msal from '@azure/msal-node';
import {authConfig} from '../authConfig'; // Assuming you have an authConfig file
const graph = require('@microsoft/microsoft-graph-client');
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

    hasRequiredDelegatedPermissions(
        accessTokenPayload: any,
        requiredPermission: string[],
    ): boolean {
        const normalizedRequiredPermissions = requiredPermission.map(permission =>
            permission.toUpperCase(),
        );
        console.log(normalizedRequiredPermissions);
        if (
            accessTokenPayload.hasOwnProperty('scp') &&
            accessTokenPayload.scp.split(' ').some((claim: string) => normalizedRequiredPermissions.includes(claim.toUpperCase()),
            )
        ) {
            return true;
        }
        return false;
    }

    async getGraphClient(accessToken: any) {
        const client = graph.init({
            // Use the provided access token to authenticate requests
            authProvider: (done: (err: any, token?: string) => void) => {
                done(null, accessToken);
            },
        });

        return client;
    }


    isClientCapableOfClaimsChallenge(accessTokenClaims: Record<string, any>): boolean {
        if (accessTokenClaims['xms_cc'] && accessTokenClaims['xms_cc'].includes('CP1')) {
            return true;
        }
        return false;
    }
}
