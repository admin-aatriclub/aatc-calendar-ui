import React from "react";
import {render, unmountComponentAtNode} from "react-dom";
import {act} from "react-dom/test-utils";
import {shallow, configure} from '../../../enzyme';
import DateTimeRange from "../DateTimeRange";

const runAllPromises = () => new Promise(setImmediate);

describe('DateTimeRange tests', () => {

    let container = null;
    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        unmountComponentAtNode(container);
        container.remove;
        container = null;
    });

    it("renders date component - null data", async () => {
        act(() => {
            render(<DateTimeRange />, container);
        });
    });

    it("DateTimeRange is correct with null dates in constructor", () => {
        let props = {
            dateLabel: "Event Date: ",
            startLabel: "Start Time: ",
            endLabel: "End Time: ",
            startDate: null,
            endDate: null
        }
        let dtr = new DateTimeRange(props);
        expect(dtr.state.startDate).toEqual(null);
        expect(dtr.state.endDate).toEqual(null);
        expect(dtr.state.maxDate).toEqual(null);
        expect(dtr.state.minDate).toEqual(null);
    });

    it("DateTimeRange is correct with a select dates in constructor", () => {
        let date = new Date();
        let start = new Date(new Date(date).setHours(8,0,0));
        let end = new Date(new Date(date).setHours(20,0,0));

        let props = {
            dateLabel: "Event Date: ",
            startLabel: "Start Time: ",
            endLabel: "End Time: ",
            startDate: start,
            endDate: end
        }
        let dtr = new DateTimeRange(props);
        expect(dtr.state.startDate).toEqual(start);
        expect(dtr.state.endDate).toEqual(end);
        expect(dtr.state.maxDate).toEqual(new Date(new Date(end).setHours(23,59,59)));
        expect(dtr.state.minDate).toEqual(new Date(new Date(start).setHours(0,0,0)));
    });

    it("DateTimeRange sets new start date as expected when start and end are null", async () => {
        let date = new Date();
        let start = null;
        let end = null;

        const wrapper = shallow(<DateTimeRange
            dateLabel="Event Date: "
            startLabel="Start Time: "
            endLabel="End Time: "
            startDate={null}
            endDate={null}
            onChangeStartDate={(d)=>{start = d}}
            onChangeEndDate={(d)=>{end = d}}
        />);
        const instance = wrapper.instance();

        expect(wrapper.state('startDate')).toBe(null);
        expect(wrapper.state('endDate')).toBe(null);
        expect(start).toBe(null);
        expect(end).toBe(null);

        instance.onChangeStartDate( date );

        await runAllPromises();

        expect(wrapper.state('startDate')).toEqual(start);
        expect(wrapper.state('endDate')).toEqual(end);
        expect(wrapper.state('maxDate')).toEqual(new Date(new Date(end).setHours(23,59,59)));
        expect(wrapper.state('minDate')).toEqual(new Date(new Date(start).setHours(0,0,0)));
    });

    it("DateTimeRange sets new start date as expected when start and end are not null", async () => {
        let origDate = new Date(2020, 3, 21, 7, 5, 5,0);
        let date = new Date();
        // let start = new Date(new Date(origDate).setHours(8, 0, 0));
        let start = null;
        let end = null;

        const wrapper = shallow(<DateTimeRange
            dateLabel="Event Date: "
            startLabel="Start Time: "
            endLabel="End Time: "
            startDate={origDate}
            endDate={new Date(new Date(origDate).setHours(20,0,0))}
            onChangeStartDate={(d)=>{start = d}}
            onChangeEndDate={(d)=>{end = d}}
        />);
        const instance = wrapper.instance();

        expect(wrapper.state('startDate')).toEqual(origDate);
        expect(wrapper.state('endDate')).toEqual(new Date(new Date(origDate).setHours(20,0,0)));
        expect(start).toBe(null);
        expect(end).toBe(null);

        instance.onChangeStartDate( date );

        await runAllPromises();

        expect(wrapper.state('startDate')).toEqual(start);
        expect(wrapper.state('endDate')).toEqual(end);
        expect(wrapper.state('maxDate')).toEqual(new Date(new Date(end).setHours(23,59,59)));
        expect(wrapper.state('minDate')).toEqual(new Date(new Date(start).setHours(0,0,0)));
    });

    it("DateTimeRange sets new start time", async () => {
        let origDate = new Date(2020, 3, 21, 7, 5, 5,0);
        let date = new Date(2020, 3, 21, 9,30,0,0);
        // let start = new Date(new Date(origDate).setHours(8, 0, 0));
        let start = null;
        let end = null;

        const wrapper = shallow(<DateTimeRange
            dateLabel="Event Date: "
            startLabel="Start Time: "
            endLabel="End Time: "
            startDate={origDate}
            endDate={new Date(new Date(origDate).setHours(20,0,0))}
            onChangeStartDate={(d)=>{start = d}}
            onChangeEndDate={(d)=>{end = d}}
        />);
        const instance = wrapper.instance();

        expect(wrapper.state('startDate')).toEqual(origDate);
        expect(wrapper.state('endDate')).toEqual(new Date(new Date(origDate).setHours(20,0,0)));
        expect(start).toBe(null);
        expect(end).toBe(null);

        instance.onChangeStartTime( date );

        await runAllPromises();

        expect(wrapper.state('startDate')).toEqual(start);
        expect(wrapper.state('endDate')).toEqual(end);
        expect(wrapper.state('maxDate')).toEqual(new Date(new Date(end).setHours(23,59,59)));
        expect(wrapper.state('minDate')).toEqual(new Date(new Date(start).setHours(0,0,0)));
    });

    it("DateTimeRange sets new end time", async () => {
        let origDate = new Date(2020, 3, 21, 7, 5, 5,0);
        let date = new Date(2020, 3, 21, 9,30,0,0);
        // let start = new Date(new Date(origDate).setHours(8, 0, 0));
        let start = null;
        let end = null;

        const wrapper = shallow(<DateTimeRange
            dateLabel="Event Date: "
            startLabel="Start Time: "
            endLabel="End Time: "
            startDate={origDate}
            endDate={new Date(new Date(origDate).setHours(20,0,0))}
            onChangeStartDate={(d)=>{start = d}}
            onChangeEndDate={(d)=>{end = d}}
        />);
        const instance = wrapper.instance();

        expect(wrapper.state('startDate')).toEqual(origDate);
        expect(wrapper.state('endDate')).toEqual(new Date(new Date(origDate).setHours(20,0,0)));
        expect(start).toBe(null);
        expect(end).toBe(null);

        instance.onChangeEndTime( date );

        await runAllPromises();

        expect(wrapper.state('startDate')).toEqual(origDate);
        expect(wrapper.state('endDate')).toEqual(end);
        expect(wrapper.state('maxDate')).toEqual(new Date(new Date(end).setHours(23,59,59)));
        expect(wrapper.state('minDate')).toEqual(new Date(new Date(origDate).setHours(0,0,0)));
    });
})
