// let a = {
//     aa: [0, 1, 2, 3],
//     cc: {
//         name: [4, 5]
//     },
//     dd: null,
//     name:'1233'
// }
// a = Observer.Watch(a)
// a.aa.push({name:11})
(function () {
  window.Observer = {};
  window.Observer.handle = {
    getter: function (value) {
      return value;
    },
    setter: (value) => {
      return value;
    },
    get(target, key) {
      let last = this.getter(target[key]);
      return last;
    },
    set(target, key, value) {
      let last = this.setter(value);
      target[key] = Observer.Watch(value, Observer.handle);
      return target;
    },
  };
  window.Observer.Watch = function (obj) {
    if (typeof obj === "object" && obj) {
      if (obj instanceof Array) {
        obj.forEach((i, index) => {
          if (typeof i === "object" && i) {
            obj[index] = this.Watch(i);
          }
        });
      } else {
        Object.entries(obj).forEach((i) => {
          let [key, value] = i;
          if (typeof value === "object" && i) {
            obj[key] = this.Watch(value);
          }
        });
      }
      return new Proxy(obj, Observer.handle);
    } else {
      return obj;
    }
  };
})();
