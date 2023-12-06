import * as msal from '@azure/msal-node';
import {inject} from '@loopback/context';
import {HttpErrors, Request, Response, RestBindings, get, requestBody} from '@loopback/rest';
import {authConfig} from '../authConfig';
import {MsalService} from '../services/msal.service'; // Assuming you have a service for MSAL operations
import {Console} from 'console';

// export class GraphController {
//   constructor(
//     @inject('services.MsalService')
//     protected msalService: MsalService,
//   ) { }

//   @post('/profile')
//   async getProfile(
//     // @inject(RestBindings.Http.REQUEST) req: Request,
//     // @inject(RestBindings.Http.RESPONSE) res: Response,
//     @requestBody({
//       content: {
//         'application/json': {
//           schema: {
//             type: 'object',
//             properties: {
//               aud: {type: 'string'},
//               iss: {type: 'string'},
//               iat: {type: 'number'},
//               nbf: {type: 'number'},
//               exp: {type: 'number'},
//               aio: {type: 'string'},
//               azp: {type: 'string'},
//               azpacr: {type: 'string'},
//               name: {type: 'string'},
//               oid: {type: 'string'},
//               preferred_username: {type: 'string'},
//               rh: {type: 'string'},
//               scp: {type: 'string'},
//               sub: {type: 'string'},
//               tid: {type: 'string'},
//               uti: {type: 'string'},
//               ver: {type: 'string'},
//             },
//           },
//         },
//       },
//     })
//     body: any,
//   ): Promise<object> {
//     // ... Your existing logic here, adjusted for TypeScript and LoopBack 4
//     // For example, instead of `req.get('authorization')`, use `req.headers.authorization`
//     // Error handling will be slightly different, using `throw new HttpErrors.Unauthorized('Your message')`
//     // Example:
//     console.log(body);
//     // if (!this.msalService.isAppOnlyToken(req)) {
//     //   throw new HttpErrors.Unauthorized('This route requires a user token');
//     // }

//     // Rest of your code logic here

//     return body; // Return the final response
//   }
// }
// // Import necessary decorators
// import {post, requestBody, Response, RestBindings} from '@loopback/rest';
// import {inject} from '@loopback/core';

// Define your controller class
export class MyController {
  constructor(
    @inject('services.MsalService') private msalService: MsalService,
    @inject(RestBindings.Http.RESPONSE) private response: Response,
    @inject(RestBindings.Http.REQUEST) private req: Request,
  ) { }

  // POST endpoint to receive JSON data
  @get('/profile')
  async processData(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              aud: {type: 'string'},
              iss: {type: 'string'},
              iat: {type: 'number'},
              nbf: {type: 'number'},
              exp: {type: 'number'},
              aio: {type: 'string'},
              azp: {type: 'string'},
              azpacr: {type: 'string'},
              name: {type: 'string'},
              oid: {type: 'string'},
              preferred_username: {type: 'string'},
              rh: {type: 'string'},
              scp: {type: 'string'},
              sub: {type: 'string'},
              tid: {type: 'string'},
              uti: {type: 'string'},
              ver: {type: 'string'},
            },
          },
        },
      },
    })
    body: any, // Use 'any' or create an interface with the required properties
  ): Promise<object> {
    // Your logic to process the JSON data goes here
    const authHeader = this.req.headers.authorization as string;

    const accessToken = authHeader.substring('Bearer '.length);

    // Now you can use accessToken as needed

    console.log(body);
    if (this.msalService.isAppOnlyToken(body)) {
      throw new HttpErrors.Unauthorized('This route requires a user token');
    }
    console.log(authConfig.protectedRoutes.profile.delegatedPermissions.scopes);

    if (this.msalService.hasRequiredDelegatedPermissions(body, authConfig.protectedRoutes.profile.delegatedPermissions.scopes)) {

      try {
        const oboToken = await this.msalService.getOboToken(accessToken);

        
      }
      catch (error) {
        if (error instanceof msal.InteractionRequiredAuthError) {
          throw new HttpErrors.BadRequest('Error Occured');
        }
      }

    }
    else {
      throw new HttpErrors.BadRequest('User does not have the required permissions');
    }


    // Change the status code to 201 (Created)
    this.response.status(201);
    // Respond with a success message or any other data
    return body;
  }
}
