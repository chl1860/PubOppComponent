var Component = require('../src/component');
var _ = require('lodash');

describe('Component test', function () {
    it('instantiated', function () {
        var Comp = Component.instantiate('#test', {});
        expect(Comp).toBeInstanceOf(Component.constructor);
    });

    it('tests renders object to be created when instantiate', function () {
        var Comp = Component.instantiate('#test', {});
        expect(Comp.renders).toBeDefined();

    });

    it('tests rend with state function', function () {
        var renderFn = jasmine.createSpy();
        var fn = function () {
            Component.rendWithState(renderFn, '');
        }

        expect(fn).toThrow('The state shoud be an object when rendering');
        // expect(renderFn).toBeCalled();
    });

    it('tests renderFn should be a function', function () {
        var renderFn = '';
        var fn = function () {
            Component.rendWithState(renderFn, {});
        }
        expect(fn).toThrow('Render function is required');

    })


    it('tests when the prop is not exists in state, it would not be added', function () {
        var Comp = Component.instantiate('#test', { renderTest: 'renderTest' });
        var renderTest = function () { };

        Comp
            .addRender('testRend', renderTest)
            .addRender('renderTest', renderTest);

        expect(Comp.renders['testRend']).not.toBeDefined();
        expect(Comp.renders['renderTest']).toBeDefined();
    });

    it('tests addRenders function',function(){
        var Comp = Component.instantiate('#test', { renderTest: 'renderTest' });
        var renderTest = function(){};
        var renderTest2 = function(){};
        
        Comp.addRenders('renderTest',[renderTest,renderTest2]);
        expect(Comp.renders["renderTest"].length).toBe(2);
    });

    it('tests rend function called', function () {
        var Comp = Component.instantiate('#test', { name: 'renderTest', state1: { name: 'state1' } });
        var renderTest = jasmine.createSpy();

        Comp
            .addRender('state1', renderTest)
            .rend();

        expect(renderTest).toBeCalled();

    });


    it('tests rend function', function () {
        var Comp = Component.instantiate('#test', { name: 'renderTest', state1: { name: 'state1' }, state2: { name: 'state2' } });
        var renderTest = jasmine.createSpy();
        Comp
            .addRender('state1', renderTest)
            .addRender('state2', renderTest)
            .rend();

        expect(renderTest).toBeCalledWith({ name: 'state1' });
        expect(renderTest).toBeCalledWith({ name: 'state2' });
    });

    it('tests when there is no prop in state, the rend would not be called', function () {
        var Comp = Component.instantiate('#test', { name: 'renderTest', state1: { name: 'state1' } });
        var renderTest = jasmine.createSpy();
        Comp
            .addRender('state1', renderTest)
            .addRender('state2', renderTest)
            .rend();

        expect(renderTest).toBeCalledWith({ name: 'state1' });
        expect(renderTest).not.toBeCalledWith({ name: 'state2' });
    });

    it('tests when the prop is not exists in renders, the rend would not be called', function () {
        var Comp = Component.instantiate('#test', { name: 'renderTest', state1: { name: 'state1' } });
        var renderTest = jasmine.createSpy();
        Comp
            .addRender('state1', renderTest)
            .rend();

        expect(renderTest).toBeCalledWith({ name: 'state1' });
        expect(renderTest).not.toBeCalledWith({ name: 'state2' });
    });

    it('tests when there is many renders with the same propName, each render should be called only once', function () {
        var Comp = Component.instantiate('#test', { name: 'renderTest', state1: { name: 'state1' } });
        var renderTest = jasmine.createSpy();
        var renderTest2 = jasmine.createSpy();

        Comp
            .addRender('state1', renderTest)
            .addRender('state1', renderTest2)
            .rend();

        expect(renderTest).toHaveBeenCalledTimes(1);
        expect(renderTest2).toHaveBeenCalledTimes(1);
    });

    it('tests addChidren function', function () {
        var Comp = Component.instantiate('#test', { name: 'renderTest', state1: { name: 'state1' }, state2: { name: 'state2' } });

        expect(Comp.children).toBeDefined();
    });

    it('test child rend', function () {
        var Comp = Component.instantiate('#test', { parentRender: {} }),
            parentRend = jasmine.createSpy(),
            childRend = jasmine.createSpy();


        Comp.addRender('parentRender', parentRend)
            .addChildren(childRend, { childRender: 'childRender' })
            .addChildren(childRend, { childRender: 'childRender' })
            .rend();

        expect(parentRend).toHaveBeenCalledTimes(1)
        expect(childRend).toHaveBeenCalledTimes(2);

    });

    it('test child array rend', function () {
        var Comp = Component.instantiate('#test', { parentRender: {} }),
            parentRend = jasmine.createSpy(),
            childRend = jasmine.createSpy();

        Comp.addRender('parentRender', parentRend)
            .addChildrenByArray([[childRend, { childRender: 'childRender' }], [childRend, { childRender: 'childRender' }]])
            .rend();

        expect(parentRend).toHaveBeenCalledTimes(1)
        expect(childRend).toHaveBeenCalledTimes(2);
    })

    it('tests child state should be object', function () {
        var Comp = Component.instantiate('#test', { parentRender: 'renderTest', childRenderState: 'childRender' });
        var child = '',
            parent = '',
            parentRend = function () {
                parent = 'parent';
            },
            childRend = function () {
                child = 'child'
            };

        expect(child).toBe('');
        expect(parent).toBe('');

        var func = function () {
            Comp.addRender('parentRender', parentRend)
                .addChildren(childRend, 'childRenderState')
                .rend();
        };

        expect(func).toThrow('The state shoud be an object when rendering');
    });

    it('tests children rend with state in parent', function () {
        var Comp = Component.instantiate('#test', { parentRender: {}, childRenderState: { childRender: 'childRender' } });
        var child = '',
            parent = '',
            parentRend = function () {
                parent = 'parent';
            },
            childRend = function () {
                child = 'child'
            };

        expect(child).toBe('');
        expect(parent).toBe('');

        Comp.addRender('parentRender', parentRend)
            .addChildren(childRend, 'childRenderState')
            .rend();

        expect(parent).toBe('parent');
        expect(child).toBe('child');
    });


    it('tests set function', function () {
        var Comp = Component.instantiate('#test', { testRender: 'testRender' })
        Comp.set('testRender', 'newValue');

        expect(Comp.latestState['testRender']).toBe('newValue');
    });

    it('tests rend when set nothing', function () {
        var Comp = Component.instantiate('#test', { testRender: {}, pchildState: { childState2: 'aaa' } }),
            testRendFn = jasmine.createSpy();
        childRendFn1 = jasmine.createSpy();
        childRendFn2 = jasmine.createSpy();

        Comp.addRender('testRender', testRendFn)
            .addChildren(childRendFn1, { childState: 'aaaa' })
            .addChildren(childRendFn2, 'pchildState')
            .rend();

        Comp.set();

        expect(testRendFn).toHaveBeenCalledTimes(1);
        expect(childRendFn1).toHaveBeenCalledTimes(1);
        expect(childRendFn2).toHaveBeenCalledTimes(1);

    });

    it('tests component should be re-rend when set diff value', function () {
        var Comp = Component.instantiate('#test', { testRender: {}, pchildState: { childState2: 'aaa' } }),
            testRendFn = jasmine.createSpy();
        childRendFn1 = jasmine.createSpy();
        childRendFn2 = jasmine.createSpy();

        Comp.addRender('testRender', testRendFn)
            .addChildren(childRendFn1, { childState: 'aaaa' })
            .addChildren(childRendFn2, 'pchildState')
            .rend();

        Comp.set('testRender', { name: '123' });

        expect(testRendFn).toHaveBeenCalledTimes(2);
        expect(childRendFn1).toHaveBeenCalledTimes(2);
        expect(childRendFn2).toHaveBeenCalledTimes(2);

    });

    it('tests component should be re-rend with new value', function () {
        var Comp = Component.instantiate('#test', { testRender: {}, pchildState: { childState2: 'aaa' } }),
            testRendFn = jasmine.createSpy();
        childRendFn1 = jasmine.createSpy();
        childRendFn2 = jasmine.createSpy();

        Comp.addRender('testRender', testRendFn)
            .addChildren(childRendFn1, { childState: 'aaaa' })
            .addChildren(childRendFn2, 'pchildState')
            .rend();

        Comp.set('testRender', { name: '123' });
        expect(testRendFn).toHaveBeenCalledWith({ name: '123' });
        expect(childRendFn1).toHaveBeenCalledWith({ childState: 'aaaa' });

        Comp.set('pchildState', { childState: '234' });
        expect(childRendFn2).toHaveBeenCalledWith({ childState: '234' });
        expect(childRendFn1).toHaveBeenCalledWith({ childState: 'aaaa' });
    });


    it('tests rend when set2 nothing', function () {
        var Comp = Component.instantiate('#test', { testRender: {}, pchildState: { childState2: 'aaa' } }),
            testRendFn = jasmine.createSpy();
        childRendFn1 = jasmine.createSpy();
        childRendFn2 = jasmine.createSpy();

        Comp.addRender('testRender', testRendFn)
            .addChildren(childRendFn1, { childState: 'aaaa' })
            .addChildren(childRendFn2, 'pchildState')
            .rend();

        Comp.set2();

        expect(testRendFn).toHaveBeenCalledTimes(1);
        expect(childRendFn1).toHaveBeenCalledTimes(1);
        expect(childRendFn2).toHaveBeenCalledTimes(1);
    });

    it('tests component should be re-rend when set diff object', function () {
        var Comp = Component.instantiate('#test', { testRender: {}, pchildState: { childState2: 'aaa' } }),
            testRendFn = jasmine.createSpy();
        childRendFn1 = jasmine.createSpy();
        childRendFn2 = jasmine.createSpy();

        Comp.addRender('testRender', testRendFn)
            .addChildren(childRendFn1, { childState: 'aaaa' })
            .addChildren(childRendFn2, 'pchildState')
            .rend();

        Comp.set2({ testRender: { name: '1234' }, pchildState: { childState2: 'aaa' } });

        expect(testRendFn).toHaveBeenCalledTimes(2);
        expect(childRendFn1).toHaveBeenCalledTimes(2);
        expect(childRendFn2).toHaveBeenCalledTimes(2);
    });

    it('tests component should be re-rend with new state', function () {
        var Comp = Component.instantiate('#test', { testRender: {}, pchildState: { childState2: 'aaa' } }),
            testRendFn = jasmine.createSpy();
        childRendFn1 = jasmine.createSpy();
        childRendFn2 = jasmine.createSpy();

        Comp.addRender('testRender', testRendFn)
            .addChildren(childRendFn1, { childState: 'aaaa' })
            .addChildren(childRendFn2, 'pchildState')
            .rend();

        Comp.set2({ testRender: { name: '123' }, pchildState: { childState2: '234' } });
        expect(testRendFn).toHaveBeenCalledWith({ name: '123' });
        expect(childRendFn1).toHaveBeenCalledWith({ childState: 'aaaa' });
        expect(childRendFn2).toHaveBeenCalledWith({ childState2: '234' });
    });

    it('tests component validator add method', function () {
        var comp = Component.instantiate('#test', {}),
            count = 0,
            option = { aa: {}, bb: {} };

        comp
            .addValidator(option)
            .addValidator({ cc: {} });
        _.forEach(comp.validators, function (o) {
            count++;
        });

        expect(count).toBe(3);
    });

    it('tests true when all the value is true', function () {
        var comp = Component.instantiate('#test', {
            tState1: { value: 'aa', visibility: true },
            tState2: { value: 'mm', visibility: true },
            tState3: { value: 'bb', visibility: true }
        }),
            option = {
                tState1: {
                    validator: function (state) {
                        return !!state.tState1.value
                    },
                },
                tState2: {
                    validator: function (state) {
                        return !!state.tState2.value
                    },
                }
            };

        var result = comp
            .addValidator(option)
            .isValid();

        expect(result).toBe(true);
    });

    it('tests false when anyone is falsy', function () {
        var comp = Component.instantiate('#test', {
            tState1: { value: 'aa', visibility: true },
            tState2: { value: '', visibility: true },
            tState3: { value: 'bb', visibility: true }
        }),
            option = {
                tState1: {
                    validator: function (state) {
                        return !!state.tState1.value
                    },
                },
                tState2: {
                    validator: function (state) {
                        return !!state.tState2.value
                    },
                }
            };

        var result = comp
            .addValidator(option)
            .isValid();

        expect(result).toBe(false);
    });

    it('tests ignore component validator with visibility', function () {
        var comp = Component.instantiate('#test', {
            tState1: { value: 'aa', visibility: true },
            tState2: { value: '', visibility: false },
            tState3: { value: 'bb', visibility: true }
        }),
            option = {
                tState1: {
                    validator: function (state) {
                        return !!state.tState1.value
                    },
                },
                tState2: {
                    validator: function (state) {
                        return !!state.tState2.value
                    },
                }
            };
        var result = comp
            .addValidator(option)
            .isValid();

        expect(result).toBe(true);
    });

    it('tests multiple validator', function () {
        var comp = Component.instantiate('#test', {
            tState1: { value: 'aa', visibility: true },
            tState2: { value: 'cc', visibility: true },
            tState3: { value: 'bb', visibility: true }
        }),
            option = {
                tState1: {
                    validator: function (state) {
                        if (state.tState1.value) {
                            if (state.tState1.value !== 'bba') {
                                this.msg = 'Invalid';
                                return false;
                            }
                            return true;
                        }
                        return !!state.tState1.value;
                    },
                    msg: 'Is required'

                },
                tState2: {
                    validator: function (state) {
                        return !!state.tState2.value
                    },
                }
            };

        var result = comp
            .addValidator(option)
            .isValid();

        expect(option.tState1.msg).toBe('Invalid');
        expect(result).toBe(false);
    });

    it('tests add event callback', function () { });
});