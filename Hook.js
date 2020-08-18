function Hook(data) {
  window.hooks = window.hooks || [];
  data.Func = [];
  let handle = {
    get(target, key) {
      return target[key];
    },
    set(target, key, value) {
      target[key] = value;
      return target;
    },
    apply: async function (target, thisArg, args) {
      for (let i = 0; i < target.Func.length; i++) {
        args = await target.Func[i](args);
      }
      target(...args);
    },
  };

  let fake = new Proxy(data, handle);
  window.hooks.push(fake);
  return fake;
}

//alert = hook(alert);
