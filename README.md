# drawRoute
在three.js的三维场景中，能根据标点位置自动生产一条不闭合的路径线，类似打游戏的时候地图上自动画的路线图，带有相机追踪动画。

# 使用
## 引用
import {drawRoute} from "drawRoute.js";

let routePointArr = [
  {x: -2.518988881824393, y: -50.00000000000001, z: -17.990614876473632},
  {x: -12.007918837355826, y: -50, z: -2.708267091585803},
  {x: 22.604352981955365, y: -50, z: -9.692990406903142},
  {x: 48.963399723178846, y: -50, z: -4.2106058834540105}
],
tempDrawRoute = null;


tempDrawRoute = new drawRoute({
  scene,
  pointArr: routePointArr,
  control,
  camera
});

animation () {
   tempDrawRoute.update();
}

如果不是拿取服务端的数据，而是从头开始点击获取标点数据的时候，需要在每次点击的时候添加：
tempDrawRoute.isClickAdd = true;
