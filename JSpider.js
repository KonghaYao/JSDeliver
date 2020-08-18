class Spider {
  constructor({
    urls,
    options = {
      method: "get",
    },
    limits = 3,
    time = 100,
    type = "test",
  }) {
    this.requestOptions = {
      urls: urls,
      options: options,
      limits: limits,
      type: type,
      time: time,
    };
    console.log("载入成功");
  }
  //请求入口函数
  async ajax(requestOptions) {
    let { urls = this.requestOptions.urls, options = this.requestOptions.options, method = this.requestOptions.method, type = this.requestOptions.type, limits = this.requestOptions.limits } = requestOptions || this.requestOptions;
    this.result = [];
    switch (type) {
      case "time":
        await this.requestTime(urls, options);
        break;
      case "sync":
        console.log("并发");
        await this.requestSync(urls, options, limits);
        break;
      case "async":
        console.log("异步队列");
        await this.requestAsync(urls, options);
        break;
      default:
        console.log("测试");
        let res = await Promise.all([0, 1, 2].map((i) => this.request(urls[i], options))).then((res) => res);
        return res;
        break;
    }
  }

  // 异步请求函数
  request(url, options) {
    return new Promise((resolve, reject) => {
      fetch(url, options)
        .then((res) => res.text())
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    });
  }
  //定时请求
  async requestTime(arr, options) {
    [...Array(arr.length)].forEach((i, index) => {
      setTimeout(this.request, index * this.requestOptions.time, arr[index], options);
    });
  }
  //队列请求

  async requestAsync(arr, options) {
    for (let i = arr.length; i--; ) {
      let res = await this.request(arr[i], options);
      console.log(new Date().getTime());
      this.result.push(res);
    }
    console.log("全部请求完成  结果在result中");
  }

  //并发请求
  async requestSync(arr, options, limits) {
    let pro = this.request;
    let limitArr = this.chunk(arr, limits);
    console.log("分组完成", limitArr);
    for (let i = 0; i < limitArr.length; i++) {
      let PromiseList = limitArr[i].map((ii) => {
        return pro(ii, options);
      });
      await Promise.all(PromiseList).then((res) => {
        this.result.push(...res);
        console.log(new Date().getTime(), PromiseList.length + "个完成");
      });
    }
    console.log("全部请求完成 结果在this.result中");
  }

  chunk(item, size) {
    if (item.length <= 0 || size <= 0) {
      return item;
    }
    let chunks = [];
    for (let i = 0; i < item.length; i = i + size) {
      chunks.push(item.slice(i, i + size));
    }
    return chunks;
  }
  //解析部分
  parse(parseList, parsefunc) {
    this.parseResult = parseList.map((i) => {
      let body = i.match(/(?<=\<body[\s\S]*?>)[\s\S]+(?=<\/body>)/)[0];
      let doc = document.createElement("div");
      doc.innerHTML = body;
      let result = parsefunc(doc);
      console.log("解析完成");
      doc.remove();
      return result;
    });
    console.log(this.parseResult);
  }
  //下载器 函数 需要自己写文件类型
  async download(fileList, nameList) {
    //处理 下载文件的名称
    let num = fileList.length;
    nameList = nameList || [...Array(num).keys()].map((i) => i + ".txt");
    console.log("下载个数 ： " + num);
    // 处理下载数组个数不等
    if (nameList.length !== num) {
      console.log("文件名数组个数：" + num + "  与文件个数不等 下载取消");
      return;
    }
    //判断数据类型 并进行相应处理
    for (let i = fileList.length; i--; ) {
      if (!(fileList[i] instanceof Blob)) {
        fileList[i] = new Blob([JSON.stringify(fileList[i])], {
          type: "text/plain",
        });
      }
    }
    console.info("blob 转换完成");
    //依据个数 使用下载方式  多于10个会压缩 小于10个会自动下载
    if (num > 10) {
      console.log("文件多于 10 个");
      let jszip = window.JSZip;
      if (!jszip) {
        let info = await this.getjszip();
        console.info(info);
      }
      //建立zip
      let zip = new JSZip();
      fileList.forEach((i, index) => {
        zip.file(nameList[index], i);
      });
      zip
        .generateAsync({
          type: "blob",
        })
        .then((content) => {
          console.info("压缩完成");
          let date = new Date();
          //回调传出
          this.downBlob([content], [date.getMonth() + 1 + "-" + date.getDate() + " " + date.getHours() + ".zip"]);
        });
    } else {
      this.downBlob(fileList, nameList);
    }
  }
  getjszip() {
    return new Promise((res) => {
      let url = "https://cdn.bootcdn.net/ajax/libs/jszip/3.5.0/jszip.min.js";
      let script = document.createElement("script");
      script.onload = () => {
        res("jszip载入成功");
      };
      script.src = url;
      document.body.appendChild(script);
    });
  }
  downBlob(fileArr, nameList) {
    fileArr.forEach((blob, index) => {
      let Url = URL.createObjectURL(blob);
      let a = document.createElement("a");
      a.href = Url;
      a.download = nameList[index];
      a.click();
      a.remove();
      console.log("完成");
    });
  }
}
