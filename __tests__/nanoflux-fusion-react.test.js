import React from 'react';
	import {withActions,connect} from '../src/index';
import Fusion from 'nanoflux-fusion';
import {mount, shallow} from "enzyme";

const Store = Fusion.getFusionStore();

// state selectors
const getTest1State = () => Store.getState().test1;
const getTest2State = () => Store.getState().test2;

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

beforeEach(() => {
	Fusion.createFusionator({
		testAction1 : (previousState, args) => {
			return { test1 : args[0] }
		}
	},{
		test1: 'test1',
		test2: 'test2',
		other: 'other',
	});
});

describe("nanoflux-fusion-react.connect", () => {
		
		it("renders App with mapped state to props", () => {
			
			const testComponent = connect(Store, mapStatesToProps)(Test);
			
			const wrapper = mount(React.createElement(testComponent));
			const props = getProps(wrapper, 'Test');
			
			expect(props.test1Prop).toBeDefined();
			expect(props.test2Prop).toBeDefined();
			expect(props.test1Prop).toBe('test1');
			expect(props.test2Prop).toBe('test2');
			
		});
		
		it("renders App with mapped state to props - updated states", () => {
			
			const testComponent = connect(Store, mapStatesToProps)(Test);
			const wrapper = mount(React.createElement(testComponent));
			
			const testAction1 = Fusion.getFusionActor('testAction1');
			testAction1("updated");
			
			const props = getProps(wrapper, 'Test');
			expect(props.test1Prop).toBe('updated');
			
		})
	}
);

describe("nanoflux-react.withActions", () => {
		
		it("renders App with mapped actions to props", () => {
			
			const mockedAction1 = jest.fn(Fusion.getFusionActor('testAction1'));
			
			const mapActionsToProps = () => ({
				testAction1: mockedAction1,
			});
			
			const testComponent = withActions(Store, mapActionsToProps)(Test);
			const wrapper = mount(React.createElement(testComponent));
			
			const propActions = getProps(wrapper, 'Test').actions;
			
			expect(propActions).toBeDefined();
			expect(propActions.testAction1).toBeDefined();
			
			propActions.testAction1("bla");
			expect(mockedAction1).toBeCalled();
		
		});
		
	}
);

describe("nanoflux-react.composition", () => {
		
		it("renders App with composed *withActions* and *connect*", () => {
			
			const mapActionsToProps = () => ({
				testAction1: Fusion.getFusionActor('testAction1'),
			});
			
			const testComponent = withActions(Store, mapActionsToProps)(
				connect(Store, mapStatesToProps)(Test)
			);
			
			const wrapper = mount(React.createElement(testComponent));
			
			let props = getProps(wrapper, 'Test');
			props.actions.testAction1('updated');
			
			props = getProps(wrapper, 'Test');
			expect(props.test1Prop).toBeDefined();
			expect(props.test1Prop).toBe('updated');
			
		});
	}
);

