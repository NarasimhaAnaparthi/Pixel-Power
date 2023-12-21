import { DataProvider } from "@refinedev/core";
import { AxiosInstance } from "axios";
import { axiosInstance, generateFilter, generateSort } from "@refinedev/simple-rest";

export const PowerPixelDataProvider = (
    apiUrl: string,
    httpClient: AxiosInstance = axiosInstance,
): Omit<
    Required<DataProvider>,
    "createMany" | "updateMany" | "deleteMany"
> => ({
    getList: async ({ resource, pagination, filters, sorters, meta }) => {
        const url = `${apiUrl}/${resource}`;

        const { data, headers } = await axiosInstance.get(
            `${url}`,
        );
        const total = +headers["x-total-count"];

        return {
            data,
            total,
        };
    },

    getMany: async ({ resource, ids, meta }) => {
        const { data } = await httpClient.get(
            `${apiUrl}/${resource}?${({ id: ids })}`,
        );

        return {
            data,
        };
    },

    create: async ({ resource, variables, meta }) => {
        const url = `${apiUrl}/${resource}`;
        let data = await axiosInstance.post(url, variables).then((res: any) => res).catch((e: any) => console.log(e, "errrrr"))
        return {
            data
        }
    },

    update: async ({ resource, id, variables, meta }) => {
        const url = `${apiUrl}/${resource}/${id}`;

        const { data } = await axiosInstance.put(url, variables);

        return {
            data,
        };
    },

    getOne: async ({ resource, id, meta }) => {
        const url = `${apiUrl}/${resource}/${id}`;

        const { data } = await httpClient.get(url);

        return {
            data,
        };
    },

    deleteOne: async ({ resource, id, variables, meta }) => {
        const url = `${apiUrl}/${resource}/${id}`;

        const { data } = await httpClient.delete(url, {
            data: variables,
        });

        return {
            data,
        };
    },

    getApiUrl: () => {
        return apiUrl;
    },

    custom: async ({
        url,
        method,
        filters,
        sorters,
        payload,
        query,
        headers,
    }) => {
        let requestUrl = `${url}?`;

        if (query) {
            requestUrl = `${requestUrl}&${(query)}`;
        }

        let axiosResponse;
        switch (method) {
            case "put":
            case "post":
                axiosResponse = await axiosInstance.post(url, payload, {
                    headers
                });
                break;
            case "patch":
                axiosResponse = await httpClient[method](url, payload, {
                    headers
                });
                break;
            case "delete":
                axiosResponse = await httpClient.delete(url, {
                    data: payload,
                    headers: headers
                });
                break;
            default:
                axiosResponse = await httpClient.get(requestUrl, {
                    headers
                });
                break;
        }

        const { data } = axiosResponse;

        return Promise.resolve({ data });
    },
});