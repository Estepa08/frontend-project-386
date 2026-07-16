import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

@service(#{
  title: "Video Meeting Booking API"
})
@server("https://api.example.com/v1", "Основной сервер")
namespace BookingApi;

// ===================== Models =====================

model Admin {
  id: string;
  name: string;
  email: string;
  createdAt: utcDateTime;
}

model AdminCreate {
  name: string;
  email: string;
  password: string;
}

model WorkingHour {
  dayOfWeek: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  startTime: string;
  endTime: string;
}

model Availability {
  workingHours: WorkingHour[];
}

model User {
  id: string;
  name: string;
  email: string;
  createdAt: utcDateTime;
}

model UserCreate {
  name: string;
  email: string;
  password: string;
}

alias MeetingCategory = "single" | "group" | "private";

model MeetingTypeInput {
  duration: 15 | 30;
  category: MeetingCategory;
}

model MeetingType extends MeetingTypeInput {
  id: int32;
  adminId: string;
  visible: boolean;
  allowGuestInvite: boolean;
}

model MeetInput {
  adminId: string;
  userId: string;
  meetingTypeId: int32;
  startTime: utcDateTime;
  endTime: utcDateTime;
  theme: string;
  comment?: string;
  guestEmails?: string[];
}

model Meet extends MeetInput {
  id: int32;
  inviteLink: string;
  status: "confirmed" | "cancelled";
  createdAt: utcDateTime;
  updatedAt: utcDateTime;
}

model MeetPatch {
  theme?: string;
  comment?: string;
  guestEmails?: string[];
  status?: "confirmed" | "cancelled";
}

model AvailableDates {
  dates: plainDate[];
}

model Slot {
  startTime: utcDateTime;
  endTime: utcDateTime;
}

model Slots {
  slots: Slot[];
}

@error
model ApiError {
  error: {
    code: string;
    message: string;
  };
}

// ===================== Operations =====================

@route("/auth")
interface Auth {
  @post
  @route("/login")
  login(
    @body input: { email: string; password: string }
  ): { token: string; role: "admin" | "user"; user: Admin | User } | ApiError;
}

@route("/admins")
interface Admins {
  @post create(@body input: AdminCreate): Admin | ApiError;

  @get list(): Admin[];

  @get get(@path id: string): Admin | ApiError;

  @patch update(@path id: string, @body input: AdminCreate): Admin | ApiError;

  @delete delete(@path id: string): void | ApiError;

  @get
  @route("/{id}/availability")
  getAvailability(@path id: string): Availability | ApiError;

  @put
  @route("/{id}/availability")
  setAvailability(@path id: string, @body input: Availability): Availability | ApiError;

  @get
  @route("/{id}/available-dates")
  getAvailableDates(
    @path id: string,
    @query month: string,
    @query meetingTypeId?: int32
  ): AvailableDates;

  @get
  @route("/{id}/slots")
  getSlots(
    @path id: string,
    @query date: plainDate,
    @query meetingTypeId?: int32
  ): Slots;

  @get
  @route("/{id}/meets")
  listMeets(
    @path id: string,
    @query status?: "confirmed" | "cancelled",
    @query date?: plainDate
  ): Meet[];

  @post
  @route("/{id}/meeting-types")
  createMeetingType(@path id: string, @body input: MeetingTypeInput): MeetingType | ApiError;

  @get
  @route("/{id}/meeting-types")
  listMeetingTypes(@path id: string): MeetingType[];
}

@route("/meeting-types")
interface MeetingTypes {
  @patch
  @route("/{id}")
  update(@path id: int32, @body input: MeetingTypeInput): MeetingType | ApiError;

  @delete
  @route("/{id}")
  delete(@path id: int32): void | ApiError;
}

@route("/users")
interface Users {
  @post create(@body input: UserCreate): User | ApiError;

  @get list(): User[];

  @get get(@path id: string): User | ApiError;

  @patch update(@path id: string, @body input: UserCreate): User | ApiError;

  @delete delete(@path id: string): void | ApiError;

  @get
  @route("/{id}/meets")
  listMeets(
    @path id: string,
    @query status?: "confirmed" | "cancelled",
    @query date?: plainDate
  ): Meet[];
}

@route("/meets")
interface Meets {
  @post create(@body input: MeetInput): Meet | ApiError;

  @get
  @route("/{id}")
  get(@path id: int32): Meet | ApiError;

  @patch
  @route("/{id}")
  update(@path id: int32, @body input: MeetPatch): Meet | ApiError;
}
