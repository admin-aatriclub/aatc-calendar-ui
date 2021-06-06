import {callApi} from "./ApiProvider";
import apiConfig from "./apiConfig";

export const getRegistrationsForEventId = async ( eventId) => {
    return await callApi(apiConfig.registrationsUrl, 'get', '/event/'+eventId, undefined, undefined );
}

export const createInitialRegistrationForEvent = async (eventId, userId) => {
    let regTypes = await getRegistrationTypesForEvent(eventId);
    let regTypeId = regTypes.data[0].Id;

    await updateRegistrationTypeForEvent(regTypeId, eventId);
    return await sendRegistrationForEvent(eventId, userId, regTypeId);
}

export const registerUserForEventId = async (eventId, userId, regTypeId) => {
    return await sendRegistrationForEvent(eventId, userId, regTypeId)
}

const sendRegistrationForEvent = async (eventId, userId, regType) => {
    return await callApi(apiConfig.registrationsUrl, 'post', '/', undefined, createRegistration(eventId, userId, '', 0, regType));
}

export const unregisterFromEvent = async (regId, cb) => {
    await callApi(apiConfig.registrationsUrl, 'delete', '/'+regId, undefined, undefined);
}

export const updateRegistration = async (reg, regTypeId) => {
    let updatedReg = createRegistration(reg.eventId, reg.memberId, reg.message, reg.numGuests);
    updatedReg.Id = reg.regId;
    updatedReg.RegistrationDate = reg.dateRegistered;
    updatedReg.RegistrationTypeId = regTypeId;
    await callApi(apiConfig.registrationsUrl,'put','/'+reg.regId, undefined, updatedReg);
    return updatedReg;
}
//
const getRegistrationTypesForEvent = async (eventId) => {
    return callApi(apiConfig.registrationsUrl, 'get', '/types/'+eventId, undefined, undefined);
}

const updateRegistrationTypeForEvent = async (regTypeId, eventId) => {
    let regTypeUpdate = createRegistrationTypeUpdateRecord(regTypeId, eventId);
    let resp = await callApi(apiConfig.registrationsUrl, 'PUT', '/types/'+regTypeId, undefined, regTypeUpdate);
    return resp;
}

const createRegistration = (eventId, userId, msg, numGuests, regType) => {
    return {
        "Event": {
            "Id": eventId
        },
        "Contact": {
            "Id" : userId
        },
        "RegistrationTypeId": regType,
        "GuestRegistrationsSummary": {
            "NumberOfGuests": numGuests,
            "NumberOfGuestsCheckedIn": 0
        },
        "IsCheckedIn": false,
        "ShowToPublic": true,
        "RegistrationDate": new Date(),
        "Memo": msg,
        "RecreateInvoice": false
    }
}

const createRegistrationTypeUpdateRecord = (regTypeId, eventId) => {
    return {
        "Id": regTypeId,
        "EventId": eventId,
        "IsEnabled": true,
        "Description": "",
        "BasePrice": 0.0000,
        "GuestPrice": 0.0000,
        "UseTaxScopeSettings": null,
        "Availability": "Everyone",
        "AvailableForMembershipLevels": null,
        "GuestRegistrationPolicy": "NumberOfGuests",
        "CurrentRegistrantsCount": 0,
        "MultipleRegistrationAllowed": false,
        "UnavailabilityPolicy": "Undefined",
        "CancellationBehaviour": "DoNotAllow",
        "CancellationDaysBeforeEvent": null,
        "IsWaitlistEnabled": false,
        "Name": "RSVP"
    }
}
