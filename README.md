# nanoflux-react

Provides [High Order Components](https://facebook.github.io/react/docs/higher-order-components.html)for convenient usage 
of [nanoflux](http://ohager.github.io/nanoflux/) with [ReactJS](https://facebook.github.io/react).

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
class Test extends React.Component {
	render() {
		return <h2>Test, {`${this.props.test1Prop}`}</h2> // uses mapped property
	}
}
```

```javascript
// maps state to property
const mapStatesToProps = {
	test1Prop: () => getTest1State(), // maps store state to property 'test1Prop'
	test2Prop: () => getTest2State()
};

const testComponent = connect('testStore', mapStatesToProps)(Test); // establish binding between selected Store and target component

const connectedAppComponent = connect('appStore', mapStateToPropsForAppStore)(App);

// now you can use connectecAppComponent as a normal React component

```

> It is highly recommended to follow the ['Dumb-Smart-Component'](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)-pattern.


### Multiple Actions and Stores

_nanoflux-react_ uses High Order Components, which makes it possible to compose the components easily. 
Using composition multiple ActionCreators and Stores can be combined and applied for the target element.

To connect a component to multiple stores you simply chain the High Order Components:

```javascript
const connectedAppComponent = connect('appStore', mapStateToPropsForAppStore)(
	                            connect('otherStore', mapStateToPropsForOtherStore)(App));
```


#To do

- Complete Readme/Doc
- Update [Project Site](http://ohager.github.io/nanoflux/)'s API doc
- Tests for [nanoflux-fusion](https://github.com/ohager/nanoflux-fusion)
- Update [nanoflux-react-demo](https://ohager.github.io/nanoflux-react-demo) using *nanoflux-react*