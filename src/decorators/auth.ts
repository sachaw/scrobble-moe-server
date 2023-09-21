// /**
//  * Authentication decorator, ESM Property Decorator
//  */
// export function auth(
//   originalMethod: any,
//   _context: ClassMethodDecoratorContext,
// ) {
//   const methodName = String(context.name);

//   function replacementMethod(this: any, ...args: any[]) {
//     console.log(`LOG: Entering method '${methodName}'.`);
//     const result = originalMethod.call(this, ...args);
//     console.log(`LOG: Exiting method '${methodName}'.`);
//     return result;
//   }

//   return replacementMethod;
// }
// // export function auth(target, key, descriptor) {
// //   const originalMethod = descriptor.value;
// //   descriptor.value = function (...args) {
// //     if (this.authenticated) {
// //       return originalMethod.apply(this, args);
// //     } else {
// //       throw new Error("Not authenticated");
// //     }
// //   };
// //   return descriptor;
// // }
