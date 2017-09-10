# nanoflux-react
[![Build Status](https://travis-ci.org/ohager/nanoflux-react.svg?branch=master)](https://travis-ci.org/ohager/nanoflux-react)
[![codecov](https://codecov.io/gh/ohager/nanoflux-react/branch/master/graph/badge.svg)](https://codecov.io/gh/ohager/nanoflux-react)

[![NPM](https://nodei.co/npm/nanoflux-react.png)](https://npmjs.org/package/nanoflux-react)


Provides [High Order Components](https://facebook.github.io/react/docs/higher-order-components.html) for convenient usage 
of [nanoflux](http://ohager.github.io/nanoflux/) and/or [nanoflux-fusion](http://ohager.github.io/nanoflux-fusion/) with [ReactJS](https://facebook.github.io/react).

Basically, it turns action functions and store states into properties for underlying components, and establish the store 
update binding, such that the properties are updated automatically on state store changes.

## Installation

`npm install nanoflux-react --save` or `yarn add nanoflux-react`

> This package requires React installed in your project (peer dependency) 

## How to use

First of all, you need to set up nanoflux as usual, e.g.

```javascript

let testState = {
	test1: 'initial',
	test2: 'initial',
};

// state selectors
const getTest1State = () => testState.test1;
const getTest2State = () => testState.test2;

// --- STORE CONFIGURATION
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

// connect stores to dispatcher
Nanoflux.getDispatcher().connectTo([
	Nanoflux.createStore('testStore', storeDescriptor),
]);


// --- ACTION CREATOR 
const actionDescriptor = {
	testAction1: function (message) {
		this.dispatch('testAction1', message); // automatically maps to 'onTestAction1' of store
	},
	testAction2: function (message) {
		this.dispatch('testAction2', message);
	},
};

// connect actions
Nanoflux.createActions('testActions', Nanoflux.getDispatcher(), actionDescriptor);

```

Afterwards, you can *enhance* your target component with the automatic store/action property binding.

### Store Connections

```jsx harmony
// our target component
const Test = (props) => <h2>Test, {`${props.test1Prop}`}</h2> // uses mapped property
```

```javascript
// maps store state to property
const mapStatesToProps = {
	test1Prop: () => getTest1State(), // maps store state to property 'test1Prop'
	test2Prop: () => getTest2State()
};

// establish binding between selected Store and target component
const connectedComponent = connect('testStore', mapStatesToProps)(Test); 

// now you can use `connectedComponent` as a normal React component, it will be updated automatically, each time
// the `testStore's` state was changed...the connected component receives the mapped states as properties.

```
> It is highly recommended to follow the ['Dumb-Smart-Component'](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)-pattern.

### Action Connections

```jsx harmony
class Test extends React.Component {
	
	constructor(props){
		super(props);
		this.onClick = this.onClick.bind(this);
	}
	
	onClick(){
		// mapped actions are available under `props.actions`
		this.props.actions.doAction("clicked");
	}
	
	render() {
		return <button onClick={ this.onClick }>Click me!</button> 
	}
}

// `actions` are the actions from 'testActions' 
const mapActionsToProps = (actions) => {
	doAction: actions.testAction1 // maps `testAction1` to property `testAction1`
	// ... map more, if needed
};

// establish binding between mapped actions and target component
const testComponent = withActions('testActions', mapActionsToProps)(Test); 

```

### Multiple Actions and Stores

_nanoflux-react_ uses High Order Components, which makes it possible to compose the components easily. 
Using composition multiple ActionCreators and Stores can be combined and applied for the target element.

To connect a component to multiple stores you simply chain the High Order Components:

```javascript
const connectedAppComponent = withActions('appActions', mapAppActionsToProps)(
	                            connect('appStore', mapStateToPropsForAppStore)(
	                                connect('otherStore', mapStateToPropsForOtherStore)(App)
	                            )
	                          );
```
> For a complete example you may look at [Nanoflux React Demo](https://github.com/ohager/nanoflux-react-demo)

# How to use with nanoflux-fusion

With [nanoflux-fusion](http://ohager.github.io/nanoflux-fusion/) it's even easier to use _nanoflux-react_, as
_nanoflux-fusion_ works with a single store only. 
When using Fusion two details are different:

1. Pass the store as object instead of its name for `connect`
2. As there is no action provider you need to use the _FusionActors_ directly for action mapper

```javascript
// --------- Begin Fusion Setup ------------------

import NanofluxFusion from 'nanoflux-fusion';

// create a 'Fusionator' (aka reducer)
NanofluxFusion.createFusionator({
    testAction1 : (previousState, args) => {
        return { test1 : args[0] }
    }
},
{ // initial state 
    test1: 'test1',
    test2: 'test2',
});

// gets the only one store
const Store = NanofluxFusion.getFusionStore();

// define state selectors
const getTest1State = () => Store.getState().test1;
const getTest2State = () => Store.getState().test2;

// --------- End Fusion Setup ------------------

// in your components file

// here's the same as with normal nanoflux
const mapStatesToProps = {
	test1Prop: () => getTest1State(),
	test2Prop: () => getTest2State()
};

// here we use the getFusionActor method.
const mapActionsToProps = () => ({
    testAction1: NanofluxFusion.getFusionActor('testAction1'),
});

// enhancing your component
const enhancedComponent = 
    // for action mapping no action provider is necessary, nor available!
    withActions(null, mapActionsToProps)(
        // you can pass the store as object, too
        connect(Store, mapStatesToProps)(YourComponent)
        );
```

#To do

- Update [Project Site](http://ohager.github.io/nanoflux/)'s doc
