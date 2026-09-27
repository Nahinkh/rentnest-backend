interface ProfileUser {
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  division: string | null;
  district: string | null;
  city: string | null;
  address: string | null;
}

export const isProfileComplete = (user: ProfileUser) => {
  return Boolean(
    user.name?.trim() &&
    user.email?.trim() &&
    user.phone?.trim() &&
    user.avatarUrl?.trim() &&
    user.division?.trim() &&
    user.district?.trim() &&
    user.city?.trim() &&
    user.address?.trim(),
  );
};
export const getMissingProfileFields = (user: ProfileUser): string[] => {
  const missingFields: string[] = [];

  if (!user.name?.trim()) missingFields.push("name");
  if (!user.email?.trim()) missingFields.push("email");
  if (!user.phone?.trim()) missingFields.push("phone");
  if (!user.avatarUrl?.trim()) missingFields.push("avatarUrl");
  if (!user.division?.trim()) missingFields.push("division");
  if (!user.district?.trim()) missingFields.push("district");
  if (!user.city?.trim()) missingFields.push("city");
  if (!user.address?.trim()) missingFields.push("address");

  return missingFields;
};
