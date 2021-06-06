// import config from '../config';


const apiConfig = {
    eventsUrl: process.env.REACT_APP_API_BASE_URL + '/events',
    contactsUrl: process.env.REACT_APP_API_BASE_URL + '/contacts',
    registrationsUrl: process.env.REACT_APP_API_BASE_URL + '/registrations',
    emailUrl: process.env.REACT_APP_API_BASE_URL + '/sendEmail',
}

export default apiConfig;
