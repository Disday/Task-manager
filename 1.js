// function f(app) {
//   return {
//     f0: () => app + 123,
//     f1: () => this.f0() + 123,
//   }
// }

// // const f1 = f().f1.bind(f());
// const { f1 } = f.apply(f(123));
// console.log(
//   f1()
// );

class C {
  constructor(app) {
    this.app = app;
  }
  f0 = () => this.app + 123
  f1 = () => this.f0() + 123
}

const { f1 } = new C(123);
console.log(
  f1()
);