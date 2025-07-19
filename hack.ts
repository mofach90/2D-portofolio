import { google } from "googleapis";
import { Langbase } from "langbase";

async function googleCalendarWorkflow({ input, env }) {
  const langbase = new Langbase({
    apiKey: env.LANGBASE_API_KEY,
  });

  const workflow = langbase.workflow({
    debug: true,
  });

  const { step } = workflow;

  try {
    // Step 1: Get calendar events using Google Calendar API
    const calendarResponse = await step({
      id: "get_calendar_events",
      run: async () => {
        let inputMessages = [
          {
            role: "user",
            content: input || "Get my Google Calendar events for the next week",
          },
        ];

        // Define Google Calendar tool schema
        const googleCalendarToolSchema = {
          type: "function" as const,
          function: {
            name: "get_calendar_events",
            description:
              "Retrieve events from Google Calendar for a specified date range",
            parameters: {
              type: "object",
              required: ["start_date", "end_date", "calendarId"],
              properties: {
                start_date: {
                  type: "string",
                  description:
                    "Start date in YYYY-MM-DD format (e.g., 2024-01-15)",
                },
                end_date: {
                  type: "string",
                  description:
                    "End date in YYYY-MM-DD format (e.g., 2024-01-22)",
                },
                calendarId: {
                  type: "string",
                  description:
                    "Calendar ID to fetch events from mohamed.islem.ayari",
                },
              },
              additionalProperties: false,
            },
            strict: true,
          },
        };

        const response = await langbase.agent.run({
          model: "openai:gpt-4.1-mini",
          apiKey: env.OPENAI_API_KEY,
          instructions:
            "You are a Google Calendar assistant. When the user asks for calendar events, use the get_calendar_events tool to retrieve them. Determine appropriate date ranges based on the user's request. If no specific time is mentioned, default to the next 7 days from today. Always provide dates in YYYY-MM-DD format.",
          input: inputMessages,
          tools: [googleCalendarToolSchema],
          stream: false,
        });

        // Push the tool call to the messages thread
        inputMessages.push(response.choices[0].message);

        // Parse the tool call
        const toolCalls = response.choices[0].message.tool_calls;
        const hasToolCalls = toolCalls && toolCalls.length > 0;

        if (hasToolCalls) {
          // For each tool call, call the Google Calendar API
          for (const toolCall of toolCalls) {
            const { name, arguments: args } = toolCall.function;
            const parsedArgs = JSON.parse(args);
            console.log({ start: parsedArgs.start_date, end: parsedArgs.end_date, calendarId: parsedArgs.calendarId });


            // Call Google Calendar API
            const result = await get_calendar_events(
              parsedArgs.start_date,
              parsedArgs.end_date,
              parsedArgs.calendarId,
              env
            );

            inputMessages.push({
              name,
              tool_call_id: toolCall.id,
              role: "tool",
              content: result,
            });
          }

          // Get the final response with calendar data
          const finalResponse = await langbase.agent.run({
            model: "openai:gpt-4.1-mini",
            apiKey: env.OPENAI_API_KEY,
            instructions:
              "Format the Google Calendar events in a clear, readable way. Show the date, time, title, and location for each event. Group events by day if there are multiple days. If there are no events, mention that the calendar is free for that period. Make the output user-friendly and well-organized.",
            input: inputMessages,
            stream: false,
          });

          return finalResponse.output;
        }

        return "No calendar events found or tool call failed.";
      },
    });

    return calendarResponse;
  } catch (err) {
    console.error("Google Calendar workflow error:", err);
    throw err;
  } finally {
    await workflow.end();
  }
}


// Google Calendar API implementation using googleapis library
async function get_calendar_events(
  start_date: string,
  end_date: string,
  calendarId: string = "mohamed.islem.ayari@gmail.com",
  env: any
) {
  try {
    // Build service-account auth
    const auth = new google.auth.GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
      credentials: {
        client_email: env.GCP_SVC_EMAIL,
        private_key: (env.GCP_SVC_KEY || "").replace(/\\n/g, "\n"),
      },
    });

    const calendar = google.calendar({ version: "v3", auth });

    const res = await calendar.events.list({
      calendarId,
      timeMin: new Date(`${start_date}T00:00:00Z`).toISOString(),
      timeMax: new Date(`${end_date}T23:59:59Z`).toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 2500,
    });

    const items = res.data.items ?? [];
    return JSON.stringify(
      items.map((ev) => ({
        id: ev.id,
        title: ev.summary,
        start: ev.start?.dateTime ?? ev.start?.date,
        end: ev.end?.dateTime ?? ev.end?.date,
        location: ev.location,
        description: ev.description,
        status: ev.status,
        attendees:
          ev.attendees?.map((attendee) => ({
            email: attendee.email,
            name: attendee.displayName || attendee.email,
            responseStatus: attendee.responseStatus,
          })) || [],
      }))
    );
  } catch (error) {
    console.error("Error fetching Google Calendar events:", error);
    return JSON.stringify({
      error: `Failed to fetch calendar events: ${error.message}`,
      events: [],
    });
  }
}

async function main(event, env) {
  const { input } = await event.json();
  const result = await googleCalendarWorkflow({ input, env });
  return result;
}

export default main;
