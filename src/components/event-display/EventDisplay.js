import React, {Component} from 'react';
import {Button} from 'react-bootstrap-buttons';
import EventDataLoader from "../event-data-loader/EventDataLoader";
import {getContact} from "../ContactProvider";
import {searchForSessionAndAdjustFields, buildRedirect} from "../Utils";
import {getRegistrationsForEventId, registerUserForEventId, unregisterFromEvent, updateRegistration} from "../RegistrationsProvider";
import {sendEmail} from "../EmailProvider";
import Modal from "react-bootstrap/Modal";
import "./EventDisplay.css";
import {getEventById} from "../EventProvider";

export default class EventDisplay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fetch: true,
            eventId: '',
            url: '',
            event: null,
            organizer: null,
            modalToggle: false,
            rsvpMessage: "",
            rsvpModalTitle: "",
            modalTextBoxType: "",
            registrations: [],
        }
        this.toggle = this.toggle.bind(this);
        this.onChangeRsvpMessage = this.onChangeRsvpMessage.bind(this);
    }

    async componentDidMount() {
        // recurring event
        await this.getEvent();
        let regs = await getRegistrationsForEventId(this.state.event.Id);
        await this.setState({
            registrations: regs.data.map(this.convertRegistrationData),
            fetch: false,
        });

        if (this.state.event && this.state.event.Details && this.state.event.Details.Organizer) {
            let contact = await getContact(this.state.event.Details.Organizer.Id);
            this.setState({organizer: contact});
        }
    }

    calendarViewClick() {
        this.props.history.push(`/?mid=${this.props.location.state.member.id}&prev=Display`);
    }

    toggle() {
        this.setState({modalToggle:!this.state.modalToggle});
    }

    async getEvent() {
        if (this.props.location.state.eventInfo.parentId && this.state.fetch) {
            let event = await getEventById(this.props.location.state.eventInfo.parentId);
            await this.setState({event: searchForSessionAndAdjustFields(event, this.props.location.state.eventInfo.eventId),});
        } else {
            let event = await getEventById(this.props.location.state.eventInfo.eventId);
            await this.setState({event: event});
        }
    }

    convertRegistrationData(reg, orig) {
        return {
            regId: reg.Id,
            memberId: reg.Contact.Id,
            eventId: reg.Event.Id,
            name: reg.DisplayName,
            message: reg.Memo,
            numGuests: reg.GuestRegistrationsSummary && reg.GuestRegistrationsSummary.NumberOfGuests ? reg.GuestRegistrationsSummary.NumberOfGuests : 0,
            dateRegistered: reg.RegistrationDate
        }
    }

    handleEditClick() {
        this.setState({editEvent: true});
    }

    canEdit() {
        return  this.props.location.state.member && this.props.location.state.eventInfo.parentId === undefined && (
            this.props.location.state.member.isAdmin || this.isUserEventOrganizer()
        )
    }

    isUserEventOrganizer() {
        return this.state.event.Details && this.state.event.Details.Organizer && this.props.location.state.member.id === this.state.event.Details.Organizer.Id;
    }

    notAlreadyRegistered() {
        return this.props.location.state.member && this.state.registrations.filter( x => this.props.location.state.member.id === x.memberId).length === 0
    }

    async handleRegisterClick() {
        let data = await registerUserForEventId(this.state.event.Id, this.props.location.state.member.id, this.state.event.Details.RegistrationTypes[0].Id);
        this.setState( state => {
            const registrations = [this.convertRegistrationData(data.data, null), ...state.registrations];
            return {
                registrations
            }
        })
    }

    async handleUnRegisterClick(regId) {
        await unregisterFromEvent(regId, (data) => {});
        this.setState( state => {
            const registrations = state.registrations.filter(reg => reg.regId !== regId);
            return {
                registrations
            }
        })
    }

    getRegTypeIdFromEvent() {
        return this.state.event.Details.RegistrationTypes[0].Id
    }

    async handleAddGuest(regId) {
        let reg = this.findRegistrationByRegId(regId);
        reg.numGuests = reg.numGuests+1;
        let regTypeId = this.getRegTypeIdFromEvent();
        let updated = await updateRegistration(reg,regTypeId);
        updated.DisplayName = this.props.location.state.member.displayName;
        await this.updateRegistrationInState(reg, updated);
    }

    async handleAddMessage() {
        let reg = Object.assign({}, this.state.registration);
        reg.message = this.state.rsvpMessage;

        let regTypeId = this.getRegTypeIdFromEvent();
        let updated = await updateRegistration(reg,regTypeId);
        updated.DisplayName = this.props.location.state.member.displayName;
        await this.updateRegistrationInState(reg, updated);

        this.setState({registration:null, rsvpMessage:''});
        this.toggle();
    }

    async handleMessagingClick() {
        await this.setState({rsvpModalTitle: "Message to RSVP Contacts", modalTextBoxType: "textarea"})
        this.toggle();
    }

    async handleSendMessage() {
        await sendEmail(this.state.event.Id, this.state.registrations, this.messageSubject(), this.memberMessage());
        await this.setState({
            rsvpModalTitle: '',
            rsvpMessage: '',
            modalTextBoxType: "text"
        });
        this.toggle();
    }
    messageSubject() {
        return "Event Update: "+this.state.event.Name+ "  "+ new Date(this.state.event.StartDate).toLocaleString();
    }
    memberMessage() {
        return "<html><body>This is concerning the event you RSVP'd to on: "+new Date(this.state.event.StartDate).toLocaleString()+"<h2>"+this.state.event.Name
        + "</h2><p><h3><u>Message from the event organizer</u>:</h3>"+ this.state.rsvpMessage+"</body></html>";
    }

    async updateRegistrationInState(reg, data) {
        await this.setState(state => {
            const registrations = state.registrations.map((item) => {
                return item.regId === reg.regId ? this.convertRegistrationData(data) : item;
            });

            return {
                registrations
            };
        });
    }

    async addMessageModal(regId) {
        let reg = this.findRegistrationByRegId(regId);
        await this.setState({registration: reg, rsvpMessage: reg.message, rsvpModalTitle: "RSVP Message", modalTextBoxType: "text"});
        this.toggle();
    }

    onChangeRsvpMessage(x) {
        this.setState({rsvpMessage: x.target.value});
    }

    findRegistrationByRegId(regId) {
        let regArray = this.state.registrations.filter(reg => reg.regId === regId);
        if (regArray.length === 1) {
            // console.log("find reg returning -> ", regArray[0]);
            return regArray[0];
        } else {
            // console.log("find reg by reg id -- returning null");
            return null;
        }
    }
    canRegisterForEvent() {
        let fee = 0.0;
        let guestFee = 0.0;

        if (!this.state.event.RegistrationEnabled) {
            return false;
        }

        this.state.event.Details.RegistrationTypes.map(reg => {
            fee += reg.BasePrice;
            guestFee += reg.GuestPrice;
            return null;
        })

        if (this.state.event.Details.TotalDue === 0 && this.state.event.Details.TotalPaid === 0 && this.props.location.state.member.id !== 0
            && fee === 0.0 && guestFee === 0.0 && !this.state.event.Sessions) {
            return true;
        }
        return false;
    }

    renderRegistrationData() {
        return this.state.registrations.map( (reg, index) => {
            const { regId, name, message, numGuests } = reg;
            return <tr key={regId}>
                <td>{name}</td>
                <td>{numGuests}</td>
                <td>{message}</td>
            </tr>
        })
    }

    render() {
        let regData = this.state.registrations ? this.state.registrations.filter(reg => reg.memberId === this.props.location.state.member.id):[];

        if (this.state.fetch) {
            return (<EventDataLoader name={this.props.location.state.name}/>);
        } else if (this.state.editEvent) {
            return buildRedirect('/editEvent', this.props.location.state.member, this.props.location.state.eventInfo);
        } else {
            return (
                <div>
                    <Button xs onClick={() => this.calendarViewClick()}>Calendar View</Button>
                    {this.canEdit() && <Button xs btnStyle="primary" onClick={() => this.handleEditClick()}>Edit Event</Button>}
                    {this.canEdit() && <Button xs btnStyle="warning" onClick={() => this.handleMessagingClick()}>Message RSVPd Members</Button>}
                    {this.notAlreadyRegistered() && this.canRegisterForEvent() && <Button xs btnStyle="success" onClick={() => this.handleRegisterClick()}>RSVP</Button>}
                    {regData.length===1 && !this.isUserEventOrganizer() && <Button xs btnStyle="danger" onClick={() => this.handleUnRegisterClick(regData[0].regId) }>Unregister</Button> }
                    {regData.length===1 && <Button xs btnStyle="secondary" onClick={() => this.handleAddGuest(regData[0].regId)}>Add Guest</Button> }
                    {regData.length===1 && <Button xs btnStyle="secondary" onClick={() => this.addMessageModal(regData[0].regId)}>Add/Edit Comment</Button> }

                    <h2>{this.state.event.Name}</h2>
                    <div className="event_id">
                        <label>Event Id: </label>&nbsp;&nbsp;
                        {this.state.event.Id}
                    </div>
                    <div className="event-title">
                        <label>Event Name: </label>&nbsp;&nbsp;
                        {this.state.event.Name}
                    </div>
                    <div className="event-start">
                        <label>Event Start Date/Time:</label>&nbsp;&nbsp;
                        {new Date(this.state.event.StartDate).toLocaleString()}
                    </div>
                    <div className="event-end">
                        <label>Event End Date/Time:</label>&nbsp;&nbsp;
                        {new Date(this.state.event.EndDate).toLocaleString()}
                    </div>
                    <div className="location">
                        <label>Event Location: </label>&nbsp;&nbsp;
                        {this.state.event.Location}
                    </div>

                    {this.state.organizer && <div className="organizer">
                        <label>Organizer: </label>&nbsp;&nbsp;
                        {this.state.organizer.displayName + '(' + this.state.organizer.email + ')'}
                    </div>}

                    <div className="descriptionHtml">
                        <label>Description: </label><br/>&nbsp;&nbsp;
                        <div dangerouslySetInnerHTML={{__html: this.state.event.Details.DescriptionHtml}} />
                    </div>

                    { this.state.event.RegistrationEnabled && <div className="registrations">
                        <label>Registrations: </label><br/>
                        <table id='registrations' className="table-striped">
                            <tbody>
                                <tr>
                                    {/*<th scope="col">Registration Id</th>*/}
                                    <th scope="col">Name</th>
                                    <th scope="col">#Guests</th>
                                    {/*<th scope="col">Date Registered</th>*/}
                                    <th scope="col">Comments</th>
                                </tr>
                                {this.renderRegistrationData()}
                            </tbody>
                        </table>
                    </div> }

                    <Modal
                        show={this.state.modalToggle}
                        onHide={this.toggle}
                        size="lg"
                        backdrop="static"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                    >
                        <Modal.Header closeButton>
                            <Modal.Title id="contained-modal-title-vcenter">
                                {this.state.rsvpModalTitle}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <h4>Please enter your message:</h4>
                            <p>
                                {this.state.modalTextBoxType==='textarea' ? <textarea
                                        value={this.state.rsvpMessage}
                                        className="form-control"
                                        onChange={this.onChangeRsvpMessage}
                                    />
                                    :
                                    <input type="text"
                                       value={this.state.rsvpMessage}
                                       className="form-control"
                                       onChange={this.onChangeRsvpMessage}
                                       />
                                    }
                            </p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button xs btnStyle="danger" onClick={this.toggle}>Cancel</Button>
                            {this.state.modalTextBoxType === 'textarea' ?
                                <Button xs onClick={() => this.handleSendMessage()}>Send Message</Button>
                                :
                                <Button xs onClick={() => this.handleAddMessage()}>Save</Button>
                            }
                        </Modal.Footer>
                    </Modal>
                    <div className="userName">
                        {this.props.location.state.member.displayName != null ? this.props.location.state.member.displayName : 'Anonymous'}
                    </div>
                </div>
            );
        }
    }
}
