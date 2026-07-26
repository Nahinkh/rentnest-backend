import { PaginationOptions } from "../interfaces/pagination";

export const paginationCalculate = (options: PaginationOptions) => {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const skip = (page - 1) * limit;
    return {
        page,
        limit,
        skip,
        sortBy: options.sortBy,
        sortOrder: options.sortOrder,
    }
}

