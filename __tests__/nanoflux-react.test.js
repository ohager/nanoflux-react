import React from 'react';
import {withActions,connect} from '../src/index';
import Nanoflux from 'nanoflux';
import {mount, shallow} from "enzyme";


// --------------------- Nanoflux Setup -------------------------------

const defaultDispatcher = Nanoflux.getDispatcher();

let testState = {
	test1: 'initial',
	test2: 'initial',
	other: 'initial',
};

// state selector
const getTest1State = () => testState.test1;
const getTest2State = () => testState.test2;
const getOtherState = () => testState.other;

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

const store2Descriptor = {
	onOtherAction1: function (arg) {
		testState.other = arg;
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
	Nanoflux.createStore('otherStore', store2Descriptor),
]);

// setup actions for dispatcher
Nanoflux.createActions('testActions', defaultDispatcher, actionDescriptor);
Nanoflux.createActions('testActions2', defaultDispatcher, actionDescriptor2);

// --------------------- Nanoflux Setup End ----------------------------

const getProps = (wrapper, component) => wrapper.find(component).props();

class Test extends React.Component {
	render() {
		return <h2>Test, {`${this.props.test1Prop}`} </h2>
	}
}

Test.displayName = 'Test';

const mapStatesToProps = {
	test1Prop: () => getTest1State(),
	test2Prop: () => getTest2State()
};

const mapStates2ToProps = {
	otherProp: () => getOtherState(),
};


beforeEach(() => {
	testState.test1 = 'test1';
	testState.test2 = 'test2';
});

describe("nanoflux-react.connect", () => {
		
		it("renders App with mapped state to props using *single* store ", () => {
			
			const testComponent = connect('testStore', mapStatesToProps)(Test);
			const wrapper = mount(React.createElement(testComponent));
			const props = getProps(wrapper, 'Test');
			expect(props.test1Prop).toBeDefined();
			expect(props.test2Prop).toBeDefined();
			expect(props.test1Prop).toBe('test1');
			expect(props.test2Prop).toBe('test2');
		});
		
		it("renders App with mapped state to props using *single* store - updated states", () => {
			
			const testComponent = connect('testStore', mapStatesToProps)(Test);
			
			const actions = Nanoflux.getActions('testActions');
			const wrapper = mount(React.createElement(testComponent));
			
			actions.testAction1('updated');
			const props = getProps(wrapper, 'Test');
			expect(props.test1Prop).toBe('updated');
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
			const wrapper = mount(React.createElement(testComponent));
			const propActions = getProps(wrapper, 'Test').actions;
			
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
			const propActions = getProps(wrapper,'Test').actions;
			
			expect(propActions).toBeDefined();
			expect(propActions.testAction1).toBeDefined();
			expect(propActions.testAction2).not.toBeDefined();
			
			propActions.testAction1();
			expect(mockedAction1).toBeCalled();
			
		});
		
	}
);

describe("nanoflux-react.composition", () => {
		
		it("renders App with composed *withActions*", () => {
			
			const actions = Nanoflux.getActions('testActions');
			const actions2 = Nanoflux.getActions('testActions2');
			const mockedAction1 = jest.fn(actions.testAction1);
			const mockedAction2 = jest.fn(actions.testAction2);
			const mockedOtherAction1 = jest.fn(actions2.otherAction1);
			
			const mapActionsToProps = (actions) => ({
				testAction1: mockedAction1,
				testAction2: mockedAction2
			});
		
			const mapActions2ToProps = (actions) => ({
				otherAction1: mockedOtherAction1
			});
			
			const testComponent = withActions('testActions2', mapActions2ToProps)(
				withActions('testActions', mapActionsToProps)(Test));
			
			const wrapper = mount(React.createElement(testComponent));
			const propActions = getProps(wrapper,'Test').actions;

			expect(propActions).toBeDefined();
			expect(propActions.testAction1).toBeDefined();
			expect(propActions.testAction2).toBeDefined();
			expect(propActions.otherAction1).toBeDefined();
			
		});
		
		it("renders App with composed *withActions* and *connect*", () => {
			
			const mapActionsToProps = (actions) => ({
				testAction1: actions.testAction1,
				testAction2: actions.testAction2
			});
			
			const testComponent = withActions('testActions', mapActionsToProps)(
				connect('testStore', mapStatesToProps)(Test));
			
			const wrapper = mount(React.createElement(testComponent));
			
			let props = getProps(wrapper, 'Test');
			
			expect(props.actions.testAction1).toBeDefined();
			expect(props.actions.testAction2).toBeDefined();
			expect(props.test1Prop).toBe('test1');
			expect(props.test2Prop).toBe('test2');
			
			props.actions.testAction1('changed1');
			props.actions.testAction2('changed2');
			
			props = getProps(wrapper, 'Test');
			expect(props.test1Prop).toBe('changed1');
			expect(props.test2Prop).toBe('changed2');
			
		});

		it("renders App with composed *connect*", () => {
			
			const testComponent = connect('otherStore', mapStates2ToProps)(
				connect('testStore', mapStatesToProps)(Test));
			
			const wrapper = mount(React.createElement(testComponent));
			
			let props = getProps(wrapper, 'Test');
			
			const actions1 = Nanoflux.getActions('testActions');
			const actions2 = Nanoflux.getActions('testActions2');
			
			actions1.testAction1('changed1');
			actions1.testAction2('changed2');
			actions2.otherAction1('changed3');
			
			props = getProps(wrapper, 'Test');
			expect(props.test1Prop).toBe('changed1');
			expect(props.test2Prop).toBe('changed2');
			expect(props.otherProp).toBe('changed3');
			
		});
	}
);

