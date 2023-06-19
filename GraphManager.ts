// Copyright (c) Microsoft.
// Licensed under the MIT license.

import {Client} from '@microsoft/microsoft-graph-client';
import { IList } from '@microsoft/microsoft-graph-types';
import {GraphAuthProvider} from './GraphAuthProvider';

// Set the authProvider to an instance
// of GraphAuthProvider
const clientOptions = {
  authProvider: new GraphAuthProvider(),
};

// Initialize the client
const graphClient = Client.initWithMiddleware(clientOptions);

export class GraphManager {
  static getUserAsync = async () => {
    // GET /me
    return await graphClient
      .api('/me')
      .select('displayName,givenName,mail,mailboxSettings,userPrincipalName')
      .get();
  };

  static getCalendarView = async (
    start: string,
    end: string,
    timezone: string,
  ) => {
    // GET /me/calendarview
    return await graphClient
      .api('/me/calendarview')
      .header('Prefer', `outlook.timezone="${timezone}"`)
      .query({startDateTime: start, endDateTime: end})
      // $select='subject,organizer,start,end'
      // Only return these fields in results
      .select('subject,organizer,start,end')
      // $orderby=createdDateTime DESC
      // Sort results by when they were created, newest first
      .orderby('start/dateTime')
      .top(50)
      .get();
  };

  static createEvent = async (newEvent: any) => {
    // POST /me/events
    await graphClient.api('/me/events').post(newEvent);
  };

  // POST request that adds an entry to the TimeSheetlist
  // POST https://graph.microsoft.com/v1.0/sites/{site-id}/lists/{list-id}/items
  // Content-Type: application/json

  // {
  //   "fields": {
  //     "Title": "Widget",
  //     "Color": "Purple",
  //     "Weight": 32
  //   }
  // }

  static createEntryTimeSheet = async (newEntry: any) => {
    // POST /me/events
    await graphClient
    .api('/sites/443fa397-f4f0-45a8-b4f0-f2197e33a1ae/lists/7ffbbbbd-9257-4485-b8f5-9755e79a762d/items')
    .post(newEntry);
  };


  // List detail GET request

  static getListDetails = async (listId: string): Promise<IList> => {
    return await graphClient
      .api(`/sites/443fa397-f4f0-45a8-b4f0-f2197e33a1ae/lists/${listId}`)
      .get();
  };
}
