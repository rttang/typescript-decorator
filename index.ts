// Step2 编写装饰器函数业务逻辑代码
function logTime(target, key, descriptor) {
  const oldMethed = descriptor.value;
  const logTime = function (...arg) {
    let start = +new Date();
    try {
      return oldMethed.apply(this, arg); // 调用之前的函数
    } finally {
      let end = +new Date();
      console.log(`耗时: ${end - start}ms`);
    }
  };
  descriptor.value = logTime;
  return descriptor;
}

// class GuanYu {
//   // Step4 利用 @ 语法糖装饰指定属性
//   @logTime
//   attack() {
//     console.log('挥了一次大刀');
//   }

//   // Step4 利用 @ 语法糖装饰指定属性
//   @logTime
//   run() {
//     console.log('跑了一段距离');
//   }
// }

// const guanYu = new GuanYu();
// guanYu.attack();
// [LOG]: 挥了一次大刀
// [LOG]: 耗时: 3ms
// guanYu.run();
// [LOG]: 跑了一段距离
// [LOG]: 耗时: 3ms

/**
 * 类装饰器
 * @参数：只接受一个参数
 * target: 类的构造器
 * @返回：如果类装饰器返回了一个值，它将会被用来代替原有的类构造器的声明
 *
 * 类装饰器适合用于继承一个现有类并添加一些属性和方法
 */
function classDecorator(target: any) {
  return; // ...
}

/**
 * 方法装饰器
 * @参数：
 * target: 对于静态成员来说是类的构造器，对于实例成员来说是类的原型链
 * propertyKey: 属性的名称
 * descriptor: 属性的描述器
 * @返回：如果返回了值，它会被用于替代属性的描述器。
 */
function methodDecorator(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  return; // ...
}

function loggerParamsResult(target, propertyKey, descriptor) {
  const original = descriptor.value;

  descriptor.value = async function (...args) {
    let result;
    let error;
    try {
      result = await original.call(this, ...args);
    } catch (e) {
      error = new Error(e);
    }
    if (error) {
      console.error('请求失败！');
      console.error('请求参数: ', ...args);
      console.error('失败原因: ', error);
    } else {
      console.log('请求成功！');
      console.log('请求参数', ...args);
      console.log('请求结果: ', result);
    }
    return result;
  };
}

class App {
  @loggerParamsResult
  request(data) {
    return new Promise((resolve, reject) => {
      const random = Math.random() > 0.5;
      if (random) {
        resolve(random);
      } else {
        reject(random);
      }
    });
  }
}

// const app = new App();
// app.request({ url: 'https://www.tencent.com' });

// [LOG]: "请求成功！"
// [LOG]: "请求参数",  {
//   "url": "https://www.tencent.com"
// }
// [LOG]: "请求结果: ",  true

// [ERR]: "请求失败！"
// [ERR]: "请求参数: ",  {
//   "url": "https://www.tencent.com"
// }
// [ERR]: "失败原因: ",  false

/**
 * 属性装饰器
 * @参数: 只接受两个参数，少了 descriptor 描述器
 * target: 对于静态成员来说是类的构造器，对于实例成员来说是类的原型链
 * propertyKey: 属性的名称
 * @返回: 返回的结果将被忽略
 */
function propertyDecorator(target: any, propertyKey: string) {}

function observable(fnName) {
  // 装饰器工厂函数
  return function (target: any, key: string): any {
    // 装饰器
    let prev = target[key];
    Object.defineProperty(target, key, {
      set(next) {
        target[fnName](prev, next);
        prev = next;
      },
    });
  };
}

class Store {
  @observable('onCountChange')
  count = -1;

  onCountChange(prev, next) {
    console.log('>>> count has changed!');
    console.log('>>> prev: ', prev);
    console.log('>>> next: ', next);
  }
}

const store = new Store();

// [LOG]: ">>> count has changed!"
// [LOG]: ">>> prev: ",  undefined
// [LOG]: ">>> next: ",  -1
// [LOG]: ">>> count has changed!"
// [LOG]: ">>> prev: ",  -1
// [LOG]: ">>> next: ",  10

// 访问器装饰器
function methodDecorator2(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  return; // ...
}

function addExtraNumber(num) {
  // 装饰器工厂函数
  return function (target, propertyKey, descriptor) {
    // 装饰器
    const original = descriptor.set;

    descriptor.set = function (value) {
      const newObj = {};
      Object.keys(value).forEach((key) => {
        newObj[key] = value[key] + num;
      });
      return original.call(this, newObj);
    };
  };
}

class C {
  private _point = { x: 0, y: 0 };

  @addExtraNumber(2)
  set point(value: { x: number; y: number }) {
    this._point = value;
  }

  get point() {
    return this._point;
  }
}

const c = new C();
c.point = { x: 1, y: 1 };

console.log(c.point);

// [LOG]: {
//   "x": 3,
//   "y": 3
// }

/**
 * 参数装饰器
 * @参数：接收三个参数
 * target: 对于静态成员来说是类的构造器，对于实例成员来说是类的原型链
 * methedKey: 方法的名称，注意！是方法的名称，而不是参数的名称
 * parameterIndex: 参数在方法中所处的位置的下标
 * @返回：返回的值将会被忽略
 */
function parameterDecorator(
  target: any,
  methedKey: string,
  parameterIndex: number
) {}

function Log(target, methedKey, parameterIndex) {
  console.log(`方法名称 ${methedKey}`);
  console.log(`参数顺序 ${parameterIndex}`);
}

class GuanYu {
  attack(@Log person, @Log dog) {
    console.log(`向 ${person} 挥了一次大刀`);
  }
}

// [LOG]: "方法名称 attack"
// [LOG]: "参数顺序 0"

function f(key: string): any {
  // console.log("初始化: ", key);
  return function () {
    console.log('执行: ', key);
  };
}

@f('8. 类')
class CC {
  @f('4. 静态属性')
  static prop?: number;

  @f('5. 静态方法')
  static method(@f('6. 静态方法参数') foo) {}

  constructor(@f('7. 构造器参数') foo) {}

  @f('2. 实例方法')
  method(@f('1. 实例方法参数') foo) {}

  @f('3. 实例属性')
  prop?: number;
}
