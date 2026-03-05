import { IQueryConfig, IQueryParams, IQueryResult, PrimsaWhereConditions, PrismaCountArgs, PrismaFindManyArgs, PrismaModelDelegate, PrismaNumberFilter, PrismaStringFilter } from "../interfaces/query.interface"


export class QueryBuilder<T, TWhereInput = Record<string, unknown>, TInclude = Record<string, unknown>> {
    private query: PrismaFindManyArgs;
    private countQuery: PrismaCountArgs;
    private page: number = 1;
    private limit: number = 10;
    private skip: number = 0;
    private sortBy: string = "createdAt";
    private sortOrder: "asc" | "desc" = "desc"
    private selectFields: Record<string, boolean> | undefined;

    constructor(
        private model: PrismaModelDelegate,
        private queryParams: IQueryParams,
        private config: IQueryConfig = {}
    ) {

        this.query = {
            where: {},
            include: {},
            orderBy: {},
            skip: 0,
            take: 10,
        }

        this.countQuery = {
            where: {}
        }

    }

    search(): this {
        const { searchTerm } = this.queryParams;
        const { searchableFields } = this.config;

        // console.log("searchTerms:", searchTerm);

        if (searchTerm && searchableFields && searchableFields.length > 0) {
            const searchConditions: Record<string, unknown>[] = searchableFields.map(field => {
                // nested relation search (e.g., author.name or post.author.name)
                if (field.includes(".")) {
                    const parts = field.split(".");

                    if (parts.length === 2) {
                        const [relation, relatedField] = parts;

                        const stringFilter: PrismaStringFilter = {
                            contains: searchTerm,
                            mode: "insensitive" as const,
                        }

                        return {
                            [relation]: {
                                [relatedField]: stringFilter
                            }
                        }
                    } else if (parts.length === 3) {
                        const [relation, nestedRelation, relatedField] = parts;

                        const stringFilter: PrismaStringFilter = {
                            contains: searchTerm,
                            mode: "insensitive" as const,
                        }

                        return {
                            [relation]: {
                                some: {
                                    [nestedRelation]: {
                                        [relatedField]: stringFilter
                                    }
                                }
                            }
                        }
                    }

                }
                // Direct field search
                const stringFilter: PrismaStringFilter = {
                    contains: searchTerm,
                    mode: "insensitive" as const,
                }

                return {
                    [field]: stringFilter
                }
            })

            const whereConsitions = this.query.where as PrimsaWhereConditions;

            whereConsitions.OR = searchConditions;

            const countWhereConditions = this.countQuery.where as PrimsaWhereConditions;

            countWhereConditions.OR = searchConditions;
        }

        return this;
    }

    filter(): this {

        const { filterableFields } = this.config;

        const excludedFields = ["searchTerm", "page", "limit", "sortBy", "sortOrder", "fields", "include"];

        const filterParams: Record<string, unknown> = {};

        Object.keys(this.queryParams).forEach(key => {
            if (!excludedFields.includes(key)) {
                filterParams[key] = this.queryParams[key];
            }
        })

        const queryWhere = this.query.where as Record<string, unknown>;
        const countQueryWhere = this.countQuery.where as Record<string, unknown>;

        Object.keys(filterParams).forEach(key => {
            const value = filterParams[key];

            if (value === undefined || value === "") {
                return;
            }

            const isAllowedFields = !filterableFields || filterableFields.length === 0 || filterableFields.includes(key);

            if (key.includes(".")) {
                const parts = key.split(".");

                if (filterableFields && !filterableFields.includes(key)) {
                    return;
                }

                if (parts.length === 2) {
                    const [relation, relationField] = parts;

                    if (!queryWhere[relation]) {
                        queryWhere[relation] = {};
                        countQueryWhere[relation] = {};
                    }

                    const queryRelation = queryWhere[relation] as Record<string, unknown>;
                    const countQueryRelation = countQueryWhere[relation] as Record<string, unknown>;

                    queryRelation[relationField] = this.parseFilterValue(value);
                    countQueryRelation[relationField] = this.parseFilterValue(value);
                    return;
                }
                else if (parts.length === 3) {
                    const [relation, nestedRelation, relationField] = parts;

                    if (!queryWhere[relation]) {
                        queryWhere[relation] = {
                            some: {}
                        };
                        countQueryWhere[relation] = {
                            some: {}
                        };
                    }

                    const queryRelation = queryWhere[relation] as Record<string, unknown>;
                    const countQueryRelation = countQueryWhere[relation] as Record<string, unknown>;

                    if (!queryRelation.some) {
                        queryRelation.some = {};
                    }

                    if (!countQueryRelation.some) {
                        countQueryRelation.some = {};
                    }

                    const querySome = queryRelation.some as Record<string, unknown>;
                    const countQuerySome = countQueryRelation.some as Record<string, unknown>;

                    if (!querySome[nestedRelation]) {
                        querySome[nestedRelation] = {};
                    }

                    if (!countQuerySome[nestedRelation]) {
                        countQuerySome[nestedRelation] = {};
                    }

                    const queryNestedRelation = querySome[nestedRelation] as Record<string, unknown>;
                    const countQueryNestedRelation = countQuerySome[nestedRelation] as Record<string, unknown>;

                    queryNestedRelation[relationField] = this.parseFilterValue(value);
                    countQueryNestedRelation[relationField] = this.parseFilterValue(value);
                    return;
                }
            }

            if (!isAllowedFields) {
                return;
            }

            // range filter parsing
            if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                queryWhere[key] = this.parseRangeFilter(value as Record<string, string | number>);
                countQueryWhere[key] = this.parseRangeFilter(value as Record<string, string | number>);
                return;
            }

            queryWhere[key] = this.parseFilterValue(value);
            countQueryWhere[key] = this.parseFilterValue(value);
        })

        return this;
    }

    paginate(): this {

        const page = Number(this.queryParams.page) || 1;
        const limit = Number(this.queryParams.limit) || 10;

        this.page = page;
        this.limit = limit;
        this.skip = (page - 1) * limit;

        this.query.skip = this.skip;
        this.query.take = limit;

        return this;
    }

    sort(): this {

        const sortBy = this.queryParams.sortBy || "createdAt";
        const sortOrder = this.queryParams.sortOrder === "asc" ? "asc" : "desc";

        this.sortBy = sortBy;
        this.sortOrder = sortOrder;

        if (sortBy.includes(".")) {
            const parts = sortBy.split(".");

            if (parts.length === 2) {
                const [relation, relationField] = parts;

                this.query.orderBy = {
                    [relation]: {
                        [relationField]: sortBy
                    }
                }
            }
            else if (parts.length === 3) {
                const [relation, nestedRelation, relationField] = parts;

                this.query.orderBy = {
                    [relation]: {
                        [nestedRelation]: {
                            [relationField]: sortOrder
                        }
                    }
                }
            }
        }
        else {
            this.query.orderBy = {
                [sortBy]: sortOrder
            }
        }

        return this;
    }

    fields(): this {
        const fieldsParam = this.queryParams.fields;
        // doctors?fields=id,name,user.name => select: { id: true, name: true, user: {
        //  select: { name: true }}}
        if (fieldsParam && typeof fieldsParam === "string") {
            const fieldsArray = fieldsParam?.split(",").map((field) => field.trim());
            this.selectFields = {}

            fieldsArray?.forEach((field) => {
                if (this.selectFields) {
                    this.selectFields[field] = true;
                }
            })

            this.query.select = this.selectFields as Record<string, boolean | Record<string, unknown>>;

            delete this.query.include;
        }
        return this;
    }

    include(relation: TInclude): this {

        if (this.selectFields) {
            return this;
        }

        this.query.include = { ...(this.query.include as Record<string, unknown>), ...(relation as Record<string, unknown>) };

        return this;
    }

    dynamicInclude(includeConfig: Record<string, unknown>,
        defaultInclude?: string[]): this {

        if (this.selectFields) {
            return this;
        }

        const result: Record<string, unknown> = {};

        defaultInclude?.forEach((field) => {
            if (includeConfig[field]) {
                result[field] = includeConfig[field];
            }
        })

        const includeParams = this.queryParams.include as string | undefined;

        if (includeParams && typeof includeParams === "string") {
            const requestedRelations = includeParams.split(",").map((relations) => relations.trim());
            requestedRelations.forEach((relation) => {
                if (includeConfig[relation]) {
                    result[relation] = includeConfig[relation];
                }
            })
        }

        this.query.include = { ...(this.query.include as Record<string, unknown>), ...result }

        return this;
    }

    where(conditions: TWhereInput): this {

        this.query.where = this.deepMerge(this.query.where as Record<string, unknown>,
            conditions as Record<string, unknown>);

        this.countQuery.where = this.deepMerge(this.countQuery.where as Record<string, unknown>, conditions as Record<string, unknown>);

        return this;
    }

    async execute(): Promise<IQueryResult<T>> {
        const [total, data] = await Promise.all([
            this.model.count(this.countQuery as Parameters<typeof this.model.count>[0]),
            this.model.findMany(this.query as Parameters<typeof this.model.findMany>[0])
        ])

        const totalPages = Math.ceil(total / this.limit);

        return {
            data: data as T[],
            meta: {
                page: this.page,
                limit: this.limit,
                total,
                totalPages
            }
        }
    }

    async count(): Promise<number> {
        return await this.model.count(this.countQuery as Parameters<typeof this.model.count>[0]);
    }

    getQuery(): PrismaFindManyArgs {
        return this.query;
    }

    private deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
        const result = { ...target };

        for (const key in source) {
            if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
                if (result[key] && typeof result[key] === "object" && !Array.isArray(result[key])) {
                    result[key] = this.deepMerge(result[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
                }
                else {
                    result[key] = source[key];
                }
            }
            else {
                result[key] = source[key];
            }
        }

        return result;

    }

    private parseFilterValue(value: unknown): unknown {
        if (value === "true") {
            return true;
        }
        if (value === "false") {
            return false;
        }
        if (typeof value === "string" && !isNaN(Number(value)) && value != "") {
            return Number(value);
        }

        if (Array.isArray(value)) {
            return { in: value.map((item) => this.parseFilterValue(item)) };
        }

        return value;
    }

    private parseRangeFilter(value: Record<string, string | number>): PrismaNumberFilter | PrismaStringFilter | Record<string, unknown> {
        const rangeQuery: Record<string, string | number | (string | number)[]> = {};

        Object.keys(value).forEach((operator) => {
            const operatorValue = value[operator];

            const parsedValue: string | number = typeof operatorValue === "string" && !isNaN(Number(operatorValue)) ? Number(operatorValue) : operatorValue;

            switch (operator) {
                case "lt":
                case "lte":
                case "gt":
                case "gte":
                case "equals":
                case "not":
                case "contains":
                case "startsWith":
                case "endsWith":
                    rangeQuery[operator] = parsedValue;
                    break;
                case "in":
                case "notIn":
                    if (Array.isArray(operatorValue)) {
                        rangeQuery[operator] = operatorValue
                    }
                    else {
                        rangeQuery[operator] = [parsedValue];
                    }
                    break;
                default:
                    break;
            }
        })

        return Object.keys(rangeQuery).length > 0 ? rangeQuery : value;
    }

}