import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/notifications' }),
  endpoints: (builder) => ({
    sendNotification: builder.mutation({
      query: (data) => ({
        url: '/send',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { useSendNotificationMutation } = notificationApi;