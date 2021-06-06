import {Redirect} from "react-router-dom";

export const memberEventTag = () => {
    return 'member-event'
}

export const emptyEvent = () => {
    return {
        EventType: 'Rsvp',
        StartDate: '',
        EndDate: '',
        Location: '',
        RegistrationEnabled: true,
        EndTimeSpecified: true,
        RegistrationsLimit: 300,
        Tags: [memberEventTag()],
        AccessLevel: 'Public',
        Details: {
            DescriptionHtml: '',
            Organizer: {
                Id: 0,
            },
            AccessControl: {
                AccessLevel: "Public",
                AvailableForAnyLevel: false,
                AvailableForLevels: [],
                AvailableForAnyGroup: false,
                AvailableForGroups: []
            },
            GuestRegistrationSettings: {
                Enabled: true,
                CreateContactMode: "NeverCreateContact"
            }
        },
        Name: ''
    }
}

export const redirect = (path, eventInfo) => {
    return <Redirect to={{pathname: path, state: { eventInfo: eventInfo}}} push />
}

export const buildRedirect = (path, member, eventInfo) => {
    return <Redirect to={{
        pathname: path,
        state: {
            member: member,
            eventInfo: eventInfo
        }
    }} push />
}

export const searchForSessionAndAdjustFields = (sessionData, sessionId) => {
    let e = Object.assign({}, sessionData);

    let sess = sessionData.Sessions.filter(x => x.Id === Number(sessionId));
    // console.log("foundSession", sess);
    if (sess) {
        e.sessionId = sess[0].Id;
        e.Name = sess[0].Title;
        e.StartDate = sess[0].StartDate;
        e.EndDate = sess[0].EndDate;
    }
    // console.log("theEvent", e);
    return e;
}
