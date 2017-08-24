import React from 'react';
import {connect} from '../src/index';
import Nanoflux from 'nanoflux';
import {mount, render, shallow} from "enzyme";
import {withActions} from "../src/nanoflux-react";


// --------------------- Nanoflux Setup -------------------------------

const defaultDispatcher = Nanoflux.getDispatcher();

let testState = {
	test1: 'initial',
	test2: 'initial',
};

// state selector
const getTest1State = () => testState.test1;
const getTest2State = () => testState.test2;

const storeDescriptor = {
	onTestAction1: function (arg) {
		testState.test1 = arg;
		this.notify(testState);
	},
	onTestAction2: function (arg) {
		testState.test2 = arg;
		this.notify(testState);
	},
};

const actionDescriptor = {
	testAction1: function (message) {
		this.dispatch('testAction1', message);
	},
	testAction2: function (message) {
		this.dispatch('testAction2', message);
	},
};

const actionDescriptor2 = {
	otherAction1: function (message) {
		this.dispatch('otherAction1', message);
	},
};

// connect stores to dispatcher
defaultDispatcher.connectTo([
	Nanoflux.createStore('testStore', storeDescriptor),
]);

// setup actions for dispatcher
Nanoflux.createActions('testActions', defaultDispatcher, actionDescriptor);
Nanoflux.createActions('testActions2', defaultDispatcher, actionDescriptor2);

// --------------------- Nanoflux Setup End ----------------------------


class Test extends React.Component {
	render() {
		return <h2>Test, {`${this.props.test1Prop}`} </h2>
	}
}

const mapStatesToProps = {
	test1Prop: () => getTest1State(),
	test2Prop: () => getTest2State()
};

beforeEach(() => {
	testState.test1 = 'test1';
	testState.test2 = 'test2';
});

describe("nanoflux-react.connect", () => {
		
		it("renders App with mapped state to props using *single* store ", () => {
			
			const testComponent = connect('testStore', mapStatesToProps)(Test);
			const wrapper = shallow(React.createElement(testComponent));
			
			expect(wrapper.props().test1Prop).toBeDefined();
			expect(wrapper.props().test2Prop).toBeDefined();
			expect(wrapper.props().test1Prop).toBe('test1');
			expect(wrapper.props().test2Prop).toBe('test2');
		});
		
		it("renders App with mapped state to props using *single* store - updated states", () => {
			
			const testComponent = connect('testStore', mapStatesToProps)(Test);
			
			const actions = Nanoflux.getActions('testActions');
			const wrapper = shallow(React.createElement(testComponent));
			
			actions.testAction1('updated');
			expect(wrapper.props().test1Prop).toBe('updated');
		})
	}
);


describe("nanoflux-react.withActions", () => {
		
		it("renders App with mapped actions to props", () => {
			
			const actions = Nanoflux.getActions('testActions');
			const mockedAction1 = jest.fn(actions.testAction1);
			const mockedAction2 = jest.fn(actions.testAction2);
			
			const mapActionsToProps = (actions) => ({
				testAction1: mockedAction1,
				testAction2: mockedAction2
			});
			
			const testComponent = withActions('testActions', mapActionsToProps)(Test);
			const wrapper = shallow(React.createElement(testComponent));
			const propActions = wrapper.props().actions;
			
			expect(propActions).toBeDefined();
			expect(propActions.testAction1).toBeDefined();
			expect(propActions.testAction2).toBeDefined();
			
			propActions.testAction1();
			expect(mockedAction1).toBeCalled();
			
			propActions.testAction2();
			expect(mockedAction2).toBeCalled();
			
		});
		
		it("renders App with *partially* mapped actions to props", () => {
			
			const actions = Nanoflux.getActions('testActions');
			const mockedAction1 = jest.fn(actions.testAction1);
			const mockedAction2 = jest.fn(actions.testAction2);
			
			const mapActionsToProps = (actions) => ({
				testAction1: mockedAction1,
			});
			
			const testComponent = withActions('testActions', mapActionsToProps)(Test);
			const wrapper = shallow(React.createElement(testComponent));
			const propActions = wrapper.props().actions;
			
			expect(propActions).toBeDefined();
			expect(propActions.testAction1).toBeDefined();
			expect(propActions.testAction2).not.toBeDefined();
			
			propActions.testAction1();
			expect(mockedAction1).toBeCalled();
			
		});
	
	}
);

