// // src/providers/passport.provider.ts

// import { Provider,inject  } from '@loopback/context';
// import {
//   AuthenticationStrategy,
//   AuthenticationBindings,
// } from '@loopback/authentication';
// import { BearerStrategy, OIDCStrategy } from 'passport-azure-ad';
// import { registerAuthenticationStrategy } from '@loopback/authentication';
// import {Context, CoreBindings} from '@loopback/core';


// export class PassportAuthenticationProvider implements Provider<BearerStrategy> {

//   constructor(
//     @inject(CoreBindings.APPLICATION_INSTANCE) private app: Context,
//   ) {}

//   value(): BearerStrategy {
//     const name = 'azureAD';
//     const strategy = new BearerStrategy({
//       identityMetadata: 'https://login.microsoftonline.com/<tenant-id>/v2.0/.well-known/openid-configuration',
//       clientID: '<your-client-id>',
//       validateIssuer: false,
//       loggingLevel: 'info',
//       passReqToCallback: false,
//     }, (token, done) => {
//       // Token is already decoded by passport-azure-ad

//     });

//     const ctx = AuthenticationBindings.CURRENT_USER;
//     registerAuthenticationStrategy(this.app, strategy);
//     return strategy;
//   }
// }
