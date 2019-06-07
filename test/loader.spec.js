var Opportunity = require('../src/loader');
var Component = require('../src/component');

describe('Opportunity tests', function () {
    var O2E;
    beforeEach(function () {
        O2E = Opportunity.O2E;
    });

    it('tests component object created', function () {
        expect(O2E.Components).toBeDefined();
    });

    it('tests component Opportunity', function () {
        var renderTest = jasmine.createSpy();

        function createComp(selector, orgState) {
            return Component.instantiate(selector, orgState)
                .addRender('state1', renderTest)
        }

        Opportunity.Components('TestComp', createComp);
        expect(O2E.Components.TestComp).toBeInstanceOf(Function);

    });

    it('tests component creation function', function () {
        var state = { name: 'renderTest', state1: { name: 'state1' } };
        var renderTest = jasmine.createSpy();

        function createComp(selector, orgState) {
            return Component.instantiate(selector, orgState)
                .addRender('state1', renderTest)
        };

        var comp = createComp('#test', state);

        expect(comp).toBeDefined();
    })

    it('tests component rend', function () {
        var renderTest = jasmine.createSpy();
        var state = { name: 'renderTest', state1: { name: 'state1' } };

        function createComp(selector, orgState) {
            return Component.instantiate(selector, orgState)
                .addRender('state1', renderTest);
        }

        Opportunity.Components('TestComp1', createComp);
        O2E.Components.TestComp1('#test', state).rend();

        expect(renderTest).toHaveBeenCalled();
    });

    it('tests combine function', function () {
        var renderTest = jasmine.createSpy();

        var state = { name: 'renderTest', state1: { name: 'state1' } };

        function createComp(selector, orgState) {
            return Component.instantiate(selector, orgState)
                .addRender('state1', renderTest)
        }

        Opportunity.Components('TestComp2', createComp);
        var comp = Opportunity.combine('TestComp2', '#test')(state);
        comp.rend();

        expect(renderTest).toBeCalled();

    });

    it('tests combineGroup functoin should be array', function () {
        var combinatorGroup = {}
        var testFn = function () {
            Opportunity.combineGroup(combinatorGroup);
        }

        expect(testFn).toThrow('the parameter should be array');

    });

    it('tests combineGroup return a function',function(){
        var combinatorGroup = [{
            compName:'TestComp1',
            selector:'#tt'
        },{
            compName:'TestComp2',
            selector:'#ttt'  
        }];

        var fn = Opportunity.combineGroup(combinatorGroup);
        expect(fn).toBeInstanceOf(Function);
    });

    it('tests combineGroup gets state and produce a component',function(){
        var state = { name: 'renderTest', state1: { name: 'state1' } };
        var combinatorGroup = [{
            compName:'TestComp1',
            selector:'#tt'
        },{
            compName:'TestComp2',
            selector:'#ttt'  
        }];

        var comp = Opportunity.combineGroup(combinatorGroup)(state);
        expect(comp.rend).toBeInstanceOf(Function);
    });

    it('tests value initiate',function(){
        Opportunity.Value('test',1);

        expect(Opportunity.Value).toBeDefined();
        var flag  = Opportunity.Value('test');
        expect(flag).toBe(1);
    });

    it('tests ComponentsInstance initiate',function(){
        expect(O2E.ComponentsInstance).toBeDefined();
    });

    it('tests ComponentsInstance set when invoke combine',function(){
        var renderTest = jasmine.createSpy();

        var state = { name: 'renderTest', state1: { name: 'state1' } };

        function createComp(selector, orgState) {
            return Component.instantiate(selector, orgState)
                .addRender('state1', renderTest)
        }

        Opportunity.Components('CombineTestComp', createComp);
        Opportunity.combine('CombineTestComp', '#test')(state);
        expect(O2E.ComponentsInstance['CombineTestComp']).toBeDefined();
        expect(O2E.ComponentsInstance['CombineTestComp'].latestState).toBe(state);

    });

    it('tests ComponentsInstance set when invoke combineGroup',function(){
        var state = { name: 'renderTest', state1: { name: 'state1' } };
        var combinatorGroup = [{
            compName:'TestComp1',
            selector:'#tt'
        },{
            compName:'TestComp2',
            selector:'#ttt'  
        }];

        Opportunity.combineGroup(combinatorGroup)(state);
        expect(O2E.ComponentsInstance['TestComp1']).toBeDefined();
        expect(O2E.ComponentsInstance['TestComp2']).toBeDefined();
    });

    it('tests get components with name',function(){
        var state = { name: 'renderTest', state1: { name: 'state1' } };
        var combinatorGroup = [{
            compName:'TestComp1',
            selector:'#tt'
        },{
            compName:'TestComp2',
            selector:'#ttt'  
        }];

        Opportunity.combineGroup(combinatorGroup)(state);
        expect(Opportunity.getComponent('TestComp1')).toBeDefined();
        expect(Opportunity.getComponent('TestComp2')).toBeDefined();
    });

    it('tests throw when the comp is not existed in ComponentsInstance',function(){
        var state = { name: 'renderTest', state1: { name: 'state1' } };
        var combinatorGroup = [{
            compName:'TestComp1',
            selector:'#tt'
        },{
            compName:'TestComp2',
            selector:'#ttt'  
        }];

        Opportunity.combineGroup(combinatorGroup)(state);
        var func = function(){
            return Opportunity.getComponent('TestCompNone')
        }
        expect(func).toThrow('The TestCompNone instance is not existed.');
    })
})


