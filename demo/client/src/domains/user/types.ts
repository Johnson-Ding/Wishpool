export type AccountStatus = "authenticated" | "profile_ready";

export type MemberStatus = "free" | "active" | "canceled" | "expired";

export interface UserState {
  accountStatus: AccountStatus;
  memberStatus: MemberStatus;
}
