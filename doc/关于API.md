# API格式

---

## 后端

1. 路由（router）：根据url后添加的字段来导航url请求至相应的控制器。定义在 ```/routes/authRoutes.js``` 中。格式如下：

   ```js
   //routes/authRoutes.js
   //GET路由
   router.get('/api/path', (req, res) => {
       res.sendFile(path.join(__dirname, 'file.html'));
   });
   //POST路由
   router.post('appi/path', (req, res) =>{
       //此路由的控制器逻辑
   });
   ```

2. 参数的第二部分是一个匿名函数，在逻辑简单时使用。当api的逻辑复杂时，可以定义一个 controller 函数。

3. 控制器（controller）：处理业务逻辑，接收路由传递过来的请求数据，处理后将结果返回给路由，路由再将结果返回给客户端。定义在``` /controllers/apiController ``` 中。格式如下：

   ```js
   //controllers/apiController
   const controller_name = async (res, req) => {
       //逻辑代码
   };
   ```

   需要异步操作的函数在定义时要添加```async```关键字。定义完成的控制器需要导出到路由文件中使用，导出添加在下方：

   ```js
   //controllers/apiController
   module.exports = {
   	controller_name,
       //其它控制器
   };
   ```

   在 ```/routes/authRoutes.js```的路由中使用，这里导入的控制器取代了原先路由第二部分的匿名函数。

   ```js
   router.post('/api/varify_token', apiController.controller_name);
   ```

4. 中间件（middlewares）：中间件是在请求传达控制器前的预处理部分，例如身份验证。使用格式如下：

   ```js
   router.get('/api/path', MiddleWare, Controller);
   ```

   当路由传递三个参数时，第二部分为中间件函数，第三部分为控制器函数。

   现在只有 ```authenticateToken```一个中间件，它可以获取 POST 或者 GET 方式请求中传入的 token，验证并解析出的用户名及uuid添加到请求中继续发给控制器。无需再次进行验证和识别用户。在控制器中解析出的用户名在```req.user.username```中，uuid 在```req.user.id```中。

## 前端

1. GET请求：访问网页的默认请求为GET，该请求只有请求头没有请求体，适用于获取网页信息等简短而无副作用的提交。格式如下：

    ```js
    const response = await fetch('/api/get_user_info', {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,	//token包含在请求头中
        },
    });
    ```

2. POST请求：包含请求头和请求体，适合大量数据的传递，格式如下：

    ```js
    const response = await fetch('/api/varify_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })	//token包含在请求体中
    });
    ```

3. 验证请求是否成功：

    ```js
    if (response.ok) {
        //...
    } else {
        //...
    }
    ```

4. 取得请求结果:

    ```js
    const results = await response.json();
    ```

