(function () {
  //name 必须是正则表达式  max代表最大深度
  /**
   * 入口函数
   * @date 2020-08-18
   * @param {RegExp} name
   * @param {number} max=5
   * @returns {Object}
   */
  window.searchWindow = function (name, max = 5) {
    if (max < 2) {
      console.log("深度不够");
    }
    if (!name instanceof RegExp && name instanceof String) {
      name = new RegExp(name);
    }
    let all = Object.entries(Globals());
    return Object.fromEntries(searchObj(all, name, max));
  };
  /**
   * 用于搜索对象中的符合正则表达式的字段
   * @date 2020-08-18
   * @param {Object} arr
   * @param {RegExp} name
   * @param {Number} deep=5
   * @returns {Object}
   */
  function searchObj(arr, name, deep = 5) {
    if (!deep) {
      return [];
    }
    deep -= 1;
    return arr.reduce((all, i) => {
      //判断 key 中是否有符合项
      if (name.test(i[0])) {
        all.push(i);
        return all;
      } else {
        //判断数据类型 分类操作
        let type = Object.prototype.toString.call(i[1]).match(/(?<=\[object\s+)\S+?(?=\])/)[0];
        switch (type) {
          //字符串和函数只需要对文字部分分析就可以了
          case "String":
            return name.test(i[1]) ? (all.push(i), all) : all;
            break;
          case "Function":
            return name.test(i[1].name) ? (all.push(i), all) : all;
            break;
          //数组 和 对象分开
          case "Array":
            var dd = searchObj(Object.entries(i[1]), name, deep).reduce((a, b) => {
              let num = parseInt(b[0]) - a.length;
              [...Array(num)].forEach(() => {
                a.push("***");
              });
              a.push(b[1]);
              return a;
            }, []);
            return dd.length ? (all.push([i[0], dd]), all) : all;
            break;
          case "Object":
            var bb = Object.fromEntries(searchObj(Object.entries(i[1]), name, deep));
            return Object.keys(bb).length === 0 ? all : (all.push([i[0], bb]), all);
            break;
          //跳过其他类型
          default:
            return all;
        }
      }
    }, []);
  }

  /**
   * 抓取全局变量的一个函数
   * @date 2020-08-18
   * @returns {Object}
   */
  function Globals() {
    //创建一个iframe来辨别window下的原始元素
    var el = document.createElement("iframe");
    el.style.display = "none";
    document.body.appendChild(el);
    var iframe = el.contentWindow;
    el.remove();
    //比较两个对象差异
    let diff = Object.entries(window).filter((prop) => !(prop[0] in iframe));
    return Object.fromEntries(diff);
  }
})();
