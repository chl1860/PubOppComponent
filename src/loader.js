var _ = require('lodash');
// var Component = require('./component');

var o2e = {};
function createModule(scope, name, factory) {
    return scope[name] || (scope[name] = factory());
}

var Components = createModule(o2e, 'Components', Object);
var ComponentsInstance = createModule(o2e,'ComponentsInstance',Object);
var Container = createModule(o2e, 'Container', Object);
var Values = createModule(o2e, 'Values', Object);

function createComponents(compName, compFactoryFn) {
    if (!_.isFunction(compFactoryFn)) {
        if (Components.hasOwnProperty(compName)) {
            return Components[compName];
        }else{
            throw 'The '+compName+' component is not existed.';
        }
    } else {
        createModule(Components, compName, function () {
            return function (selector, orgState) {
                return compFactoryFn(selector, orgState);
            }
        });
    }
}

function createContainer(containerName, factoryFn) {
    var self = this;
    if (!_.isFunction(factoryFn)) {
        return Container[containerName];
    } else {
        if (o2e.Container.hasOwnProperty(containerName)) {
            throw compName + ' is existed in container group';
        }
        createModule(Container, containerName, function () {
            return function () {
                return factoryFn.apply(self, arguments);
            }
        });
    }
}

function createValue(valName, val) {
    if (_.isUndefined(val) && _.isString(valName)) {
        return Values[valName];
    } else {
        if (o2e.Values.hasOwnProperty(valName)) {
            throw valName + ' is existed in container group';
        }
        createModule(Values, valName, function () {
            return val;
        });
    }
}

function updateValue(valName, val) {
    if (!o2e.Values.hasOwnProperty(valName)) {
        throw valName + ' is not existed in container group, please init it before seting it';
    } else {
        Values[valName] = val;
    }
}

function combine(compName, selector) {
    return function (orgState) {
        var comp = createComponents(compName)(selector, orgState);
        ComponentsInstance[compName] = comp;
        return comp;
    }
}

/**
 * 
 * @param {Object} combinatorItems 
 * @returns function waiting for state
 */
function combineGroup(combinatorItems) {
    if (!_.isArray(combinatorItems)) {
        throw 'the parameter should be array';
    }
    var combinators = _.map(combinatorItems, function (item) {
        return combine(item.compName, item.selector)
    });

    return function (state) {
        var results = _.map(combinators, function (cm) {
            return cm(state);
        });

        return results[0]
    }

}

function getComponent(compName){
    if(ComponentsInstance.hasOwnProperty(compName)){
        return ComponentsInstance[compName];
    }else{
        throw 'The '+compName +' instance is not existed.';
    }
}

module.exports = {
    Components: createComponents,
    getComponent:getComponent,
    Container: createContainer,
    UpdateValue: updateValue,
    Value: createValue,
    combine: combine,
    combineGroup: combineGroup,
    O2E: o2e
}