// const f = (app) => {
//   const fs = {
//     f0: () => app + 123,
//     f1: () => fs.f0() + 123,
//   };
//   return fs;
// }

// const { f1 } = f(123).f1;
// console.log(
//   f1()
// );

 class C {
  static get a(){
    return 1
  }
}

const o = new C();
console.log(
  o.a,
  C.a
);