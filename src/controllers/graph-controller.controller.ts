import * as msal from '@azure/msal-node';
import {inject} from '@loopback/context';
import {HttpErrors, Request, Response, RestBindings, get, post, requestBody} from '@loopback/rest';
import {authConfig} from '../authConfig';
import {MsalService} from '../services/msal.service'; // Assuming you have a service for MSAL operations
import {ResponseType} from '@microsoft/microsoft-graph-client';

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
              Authorization: {type: 'string'},
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
  ): Promise<any> {
    // TODO
    console.log(body);

    console.log(authConfig.protectedRoutes.profile.delegatedPermissions.scopes);
    const authHeader = this.req.headers.authorization as string;

    const accessToken = authHeader.substring('Bearer '.length);
    console.log(accessToken);


    try {
      const oboToken = await this.msalService.getOboToken(accessToken);

      const graphClient = await this.msalService.getGraphClient(oboToken);
      const graphResponse = await graphClient.api('/me').responseType(ResponseType.RAW).get();
      if (graphResponse.status === 401) {
        if (graphResponse.headers.get('WWW-Authenticate')) {
          if (this.msalService.isClientCapableOfClaimsChallenge(body)) {

            this.response
              .status(401)
              .header('WWW-Authenticate', graphResponse.headers.get('WWW-Authenticate') || '')
              .send({errorMessage: 'Continuous access evaluation resulted in claims challenge'});

          }

          this.response.status(401).send({
            errorMessage: 'Continuous access evaluation resulted in claims challenge but the client is not capable. Please enable client capabilities and try again',
          });
        }
        throw new HttpErrors.Unauthorized('Unauthorized');
      }
      const graphData = await graphResponse.json();
      this.response.status(200).send(graphData);

      // this.response.status(201);
      // // Respond with a success message or any other data
      // return body;
    }
    catch (error) {
      if (error instanceof msal.InteractionRequiredAuthError) {
        throw new HttpErrors.BadRequest('Error Occured');
      }
    }

    // Change the status code to 201 (Created)

  }
}
