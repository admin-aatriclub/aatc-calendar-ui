import {callApi} from "./ApiProvider";
import apiConfig from "./apiConfig";

export const sendEmail = async (eventId, recipArray, subject, text) => {
    return callApi(apiConfig.emailUrl,'post', '/', undefined, makeMessage(eventId,recipArray, subject,text));
}

const makeMessage = (eventId, recipArray, subject, text) => {
    return {
        Subject: subject,
        Body: text,
        Recipients: processRecipients(recipArray),
        EventId: eventId
    }
}

const processRecipients = (recipArray) => {
    let recipients = recipArray.map((recip) => {
        return {
            Id: recip.memberId,
            Type: "IndividualContactRecipient"
        }
    });
    return recipients;
}
