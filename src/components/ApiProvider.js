import axios from "axios";

export const callApi = async (baseUrl, method, endpoint, params, body ) => {
    // console.log("CALLING API", baseUrl,  method, endpoint, params, body);
    // console.log("BODY", body);
    let resp = await axios(endpoint, {
        method: method,
        params: params,
        baseURL: baseUrl,
        headers: {
            'Content-Type': 'application/json'
        },
        data: body,
    });
    // console.log("RESPONSE", resp);
    return resp.data;
}
