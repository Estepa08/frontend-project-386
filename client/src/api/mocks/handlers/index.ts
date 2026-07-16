import { authHandlers } from "./auth";
import { bookingHandlers } from "./booking";
import { availabilityHandlers } from "./availability";
import { meetingTypesHandlers } from "./meetingTypes";
import { meetsHandlers } from "./meets";

export const handlers = [
  ...authHandlers,
  ...bookingHandlers,
  ...availabilityHandlers,
  ...meetingTypesHandlers,
  ...meetsHandlers,
];
