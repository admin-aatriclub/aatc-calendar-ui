import axios from "axios";
import apiConfig from "./apiConfig";

export const getContact = async (contactId) => {
    const resp = await axios('/'+contactId, {
        method: 'get',
        baseURL: apiConfig.contactsUrl,
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return resp.data.data;
}
