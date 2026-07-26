import { PaginationOptions } from "../interfaces/pagination";

const pagination = (options: PaginationOptions) => {
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