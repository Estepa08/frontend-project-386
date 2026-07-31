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
  slotDurations: ("15" | "30")[];
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
  name: string;
  email?: string;
  theme: string;
  startTime: utcDateTime;
  endTime: utcDateTime;
}

model Meet extends MeetInput {
  id: int32;
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

@route("/available-dates")
interface AvailableDatesApi {
  @get get(@query month: string, @query duration: "15" | "30"): AvailableDates;
}

@route("/slots")
interface SlotsApi {
  @get get(@query date: plainDate, @query duration: "15" | "30"): Slots;
}

@route("/meets")
interface Meets {
  @get list(@query status?: "confirmed" | "cancelled", @query date?: plainDate): Meet[];

  @post create(@body input: MeetInput): Meet | ApiError;

  @get
  @route("/{id}")
  get(@path id: int32): Meet | ApiError;

  @patch
  @route("/{id}")
  update(@path id: int32, @body input: MeetPatch): Meet | ApiError;
}
