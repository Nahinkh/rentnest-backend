import { Role, Status } from "../../../generated/prisma/enums";


export interface IAdminUserFilters {
  searchTerm?: string;
  role?: Role;
  status?:Status;
}

export interface IAdminRentalFilters {
    searchTerm?: string;
    status?: Status;
    availability?: string;
    location?: string;
}