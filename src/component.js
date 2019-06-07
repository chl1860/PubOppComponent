
var _ = require('lodash');
var $ = require('jquery');
// /**
//    * @param fn {Function}   实际要执行的函数
//    * @param delay {Number}  延迟时间，也就是阈值，单位是毫秒（ms）
//    * @return {Function}     返回一个“去弹跳”了的函数
//    */
// function debounce(fn, delay) {
//     var timer
//     // 返回一个函数，这个函数会在一个时间区间结束后的 delay 毫秒时执行 fn 函数
//     return function () {
//         // 保存函数调用时的上下文和参数，传递给 fn
//         var context = this
//         var args = arguments
//         // 每次这个返回的函数被调用，就清除定时器，以保证不执行 fn
//         clearTimeout(timer)
//         // 当返回的函数被最后一次调用后（也就是用户停止了某个连续的操作），
//         // 再过 delay 毫秒就执行 fn
//         timer = setTimeout(function () {
//             fn.apply(context, args)
//         }, delay)
//     }
// }

function instantiate(WrapperedFn, selector, state) {
    var instance = Object.create(WrapperedFn.prototype);
    WrapperedFn.call(instance, selector, state);
    return instance;
}

function Component(rootSelector, state) {
    this.rootSelector = rootSelector;
    this.root = $(rootSelector);
    this.renders = {};
    this.latestState = state;
    this.children = []; //combined components
    this.validators = {};
}

/**
 * @param {render:func<renderFunc(state):string, htmlString>}
 * @returns {this}
 */
Component.prototype.addRender = function (propName, renderFn) {
    var self = this;

    if (!!self.latestState[propName]) {
        if (!self.renders[propName]) {
            self.renders[propName] = [];
        }
        this.renders[propName].push([propName, renderFn]);
    }

    return self;
};

Component.prototype.addRenders = function (propName, renderFns) {
    var self = this;

    if (!_.isArray(renderFns)) {
        self.addRender(propName,renderFns);
    }else{
        _.forEach(renderFns,function(renderFn){
            self.addRender(propName,renderFn);
        });
    }

    return self;
}

Component.prototype.addChildren = function (renderFn, childState) {
    var self = this;

    self.children.push([childState, renderFn]);

    return self;
};

Component.prototype.addChildrenByArray = function (children) {
    var self = this;
    _.forEach(children, function (child) {
        self.addChildren(child[0], child[1]);
    });

    return self;
}

function rendWithState(renderFn, state) {
    if (!_.isObject(state)) {
        throw 'The state shoud be an object when rendering';
    }

    if (!_.isFunction(renderFn)) {
        throw 'Render function is required';
    }
    return renderFn(state);
}

function rendOnce(rendItem, scope) {
    var propName = rendItem[0],
        args = scope.latestState[propName],
        func = rendItem[1];

    return rendWithState(func, args);
}

/**
 * @returns {this}
 */
Component.prototype.rend = function () {
    var self = this,
        inner = "";

    _.forEach(self.renders, function (rds) {
        _.forEach(rds, function (rdItem) {
            inner += rendOnce(rdItem, self);
        });
    });

    //console.log(self.getLatestState());
    //render children
    _.forEach(self.children, function (child) {
        if (_.isObject(child[0])) {
            state = child[0];
            inner += rendWithState(child[1], child[0]);
        }

        if (_.isString(child[0])) {
            inner += rendOnce(child, self);
        }
    });

    self.root.empty().append(inner.replace(/\>,\</, '><'));
    return self;
};

/**
 * @param evtName {string}
 * @param cb {func(e,state)}
 * @returns {undefined}
 */
Component.prototype.addEventCallback = function (evtName /**ev1 ev2...*/, cb) {
    var self = this,
        debounceTime = 0;
    self.root.off(evtName);
    if (/\binput\b/i.test(evtName)) {
        debounceTime = 1000;
    }
    self.root.on(evtName, _.debounce(function (e) {
        var st = cb(e, self.latestState);

        self.latestState = st || self.latestState;
        self.rend();
        console.log(self.getLatestState());
    }, debounceTime));
}

/**
 * @param evtName {string}
 * @param cb{func(e)}
 * @returns {undefined}
 */
Component.prototype.addListener = function (evtName /**ev1 ev2...*/, cb) {
    var self = this,
        evtArray = evtName.split(/\s/g);
    _.forEach(evtArray, function (ev) {
        self.root.off(ev);
        self.root.off(ev);
        if (/\binput\b/i.test(ev)) {
            self.root.on(ev, 'input', _.debounce(function (e) {
                cb(e);
                console.log(self.getLatestState());
            }, debounceTime));
        } else {
            self.root.on(ev, 'button', function (e) {
                cb(e);
            });
        }

    });

}

/**
 * @param propName:String
 * @param newValue:any
 * @returns void
 */
Component.prototype.set = function (propName, newValue) {
    var self = this;

    if (!!self.latestState[propName] && !_.isEqual(self.latestState[propName], newValue)) {
        self.latestState[propName] = newValue;
        self.rend()
    }
};

Component.prototype.set2 = function (newValue) {
    var self = this;
    if (!_.isUndefined(newValue) && !_.eq(self.latestState, newValue)) {
        self.latestState = newValue;

        self.rend()
    }
}

/**
 * @param ption:Object
 * @returns this
 */
Component.prototype.addValidator = function (option) {
    var self = this;

    if (_.isUndefined(self.validators)) {
        self.validators = option;
    } else {
        self.validators = _.extend(self.validators, option);
    }

    return self;
};

/**
 * @param none
 * @returns boolean
 */
Component.prototype.isValid = function () {
    var self = this,
        option = self.validators,
        keys = Object.keys(option),
        state = self.latestState,
        index = keys.length - 1,
        validResult = 0,
        propName,
        flag;

    if (_.isUndefined(self.validators)) {
        throw 'Validator option is required';
    }

    while (index >= 0) {
        propName = keys[index--];

        if (/\bfunction\b/i.test(Object.prototype.toString.call(option[propName].validator))) {
            flag = !!(option[propName].validator.call(option[propName], state));
        } else if (/\bboolean\b/i.test(Object.prototype.toString.call(option[propName].validator))) {
            flag = !!option[propName].validator;
        }


        if (state[propName].visibility && !flag) {
            // $('[name=' + propName + ']').attr('title', this.option[propName].msg).addClass('opp-required');
            //console.log(option[propName].msg);
            state[propName].valid = flag;
            validResult += 1;
        } else {
            $('[name=' + propName + ']').attr('title', '').removeClass('opp-required');
            state[propName].valid = true;
        }

    }

    return !(validResult > 0);
}
/**
 * @returns {latestState}
 */
Component.prototype.getLatestState = function () {
    return this.latestState;
};


module.exports = {
    instantiate: function (selector, state) {
        return instantiate(Component, selector, state);
    },

    rendWithState: rendWithState,
    constructor: Component
};