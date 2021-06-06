import {callApi} from "./ApiProvider";
import apiConfig from "./apiConfig";

export const getEventById = async (eventId) => {
    const resp = await callApi(apiConfig.eventsUrl,'get','/'+eventId, undefined, undefined);
    return resp.data;
}

export const udpateEvent = async (eventId, theEvent) => {
    const resp = await callApi(apiConfig.eventsUrl, 'put', '/'+eventId, undefined, theEvent);
    return resp.data;
}

export const deleteEvent = async (eventId) => {
    const resp = await callApi(apiConfig.eventsUrl, 'delete', '/'+eventId, undefined, undefined);
    return resp.data;
}
