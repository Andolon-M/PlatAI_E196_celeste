interface PaginatedData<T> {
    previousPage: number | null;
    currentPage: number;
    nextPage: number | null;
    total: number;
    totalPages: number;
    limit: number;
    data: T[];
}

interface Data<T> {
    rows: T[];
    count: number;
}

/**
 * Función para paginar los datos.
 * @param data - Los datos a paginar en formato { rows: data, count: data.length }.
 * @param pageSize - El número máximo de elementos por página.
 * @param page - El número de página actual.
 */
// TODO: Arreglar todos los demas paginados
export const pagination = async <T>(data: Data<T>, pageSize: number, page: number): Promise<PaginatedData<T>> => {
    try {
        const pageNumber = Number.isNaN(page) || page < 1 ? 1 : Math.floor(page);

        const { rows, count } = data;
        const totalPages = Math.ceil(count / pageSize);

        if (pageNumber > totalPages) {
            return {
                previousPage: null,
                currentPage: 1,
                nextPage: null,
                total: 0,
                totalPages: 0,
                limit: 0,
                data: []
            };
        }

        const offset = (pageNumber - 1) * pageSize;
        const limit = pageNumber === totalPages ? count - offset : pageSize;

        return {
            previousPage: getPreviousPage(pageNumber),
            currentPage: pageNumber,
            nextPage: getNextPage(pageNumber, totalPages),
            total: count,
            totalPages: totalPages,
            limit: limit,
            data: rows
        };
    } catch (error) {
        console.error("Pagination error:", error);
        throw new Error("Error paginating data");
    }
};

const getNextPage = (currentPage: number, totalPages: number): number | null => {
    return currentPage < totalPages ? currentPage + 1 : null;
};

const getPreviousPage = (currentPage: number): number | null => {
    return currentPage > 1 ? currentPage - 1 : null;
};
