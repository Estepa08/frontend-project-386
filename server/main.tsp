import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

@service(#{
  title: "Video Meeting Booking API"
})
@server("http://localhost:3001/api", "Локальный сервер")
namespace BookingApi;

// ===================== Models =====================

model WorkingHour {
  dayOfWeek: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  startTime: string;
  endTime: string;
}

model Availability {
  workingHours: WorkingHour[];
}

model EventType {
  id: int32;
  title: string;
  description: string;
  durationMinutes: int32;
}

model EventTypeInput {
  title: string;
  description: string;
  durationMinutes: int32;
}

model Slot {
  startTime: string;
  endTime: string;
}

model Slots {
  slots: Slot[];
}

model AvailableDates {
  dates: plainDate[];
}

model MeetInput {
  eventTypeId: int32;
  name: string;
  email?: string;
  theme: string;
  startTime: utcDateTime;
}

model Meet extends MeetInput {
  id: int32;
  endTime: utcDateTime;
  inviteLink: string;
  status: "confirmed" | "cancelled";
  createdAt: utcDateTime;
  updatedAt: utcDateTime;
}

model MeetPatch {
  name?: string;
  email?: string;
  theme?: string;
  status?: "confirmed" | "cancelled";
}

@error
model ApiError {
  error: {
    code: string;
    message: string;
  };
}

// ===================== Operations =====================

@route("/availability")
interface AvailabilityApi {
  @get get(): Availability;

  @put set(@body input: Availability): Availability | ApiError;
}

@route("/event-types")
interface EventTypes {
  @get list(): EventType[];

  @post
  create(@body input: EventTypeInput): {
    @statusCode statusCode: 201;
    ...EventType;
  } | ApiError;

  @get
  @route("/{id}")
  get(@path id: int32): EventType | ApiError;

  @patch
  @route("/{id}")
  update(@path id: int32, @body input: EventTypeInput): EventType | ApiError;

  @delete
  @route("/{id}")
  delete(@path id: int32): {
    @statusCode statusCode: 204;
  } | ApiError;
}

@route("/event-types/{eventTypeId}/available-dates")
interface EventTypeAvailableDates {
  @get get(@path eventTypeId: int32): AvailableDates | ApiError;
}

@route("/event-types/{eventTypeId}/slots")
interface EventTypeSlots {
  @get get(@path eventTypeId: int32, @query date: plainDate): Slots | ApiError;
}

@route("/meets")
interface Meets {
  @get list(@query status?: "confirmed" | "cancelled", @query date?: plainDate): Meet[];

  @post
  create(@body input: MeetInput): {
    @statusCode statusCode: 201;
    ...Meet;
  } | ApiError;

  @get
  @route("/{id}")
  get(@path id: int32): Meet | ApiError;

  @patch
  @route("/{id}")
  update(@path id: int32, @body input: MeetPatch): Meet | ApiError;
}
