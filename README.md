# drawRoute

在three.js的三维场景中，能根据标点位置自动生产一条不闭合的路径线，类似打游戏的时候地图上自动画的路线图，带有相机追踪动画。

# 使用

## 引用

`import {drawRoute} from "drawRoute.js";`

## 定义变量

```javascript
// routePointArr是你点击场景获取到的三维向量点的位置数据，放一个vector3数据，tempDrawRoute就是实例化构造函数的变量
let routePointArr = [],tempDrawRoute = null;
```

## 实例化构造函数并传参

```javascript
tempDrawRoute = new drawRoute({
  scene, // 场景
  pointArr: routePointArr,
  control, // 相机控制器
  camera // 相机
});
```

## 动画中使用update

```javascript
animation () {
   tempDrawRoute.update();
}
```

# 注意

如果不是拿取服务端的数据，直接赋值的，而是从头开始点击获取标点数据的时候，需要在每次点击的时候添加：
tempDrawRoute.isClickAdd = true;
