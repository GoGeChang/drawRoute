import * as THREE from "three";
import gsap from "gsap";
import  { Line2 }  from  'three/examples/jsm/lines/Line2';  // line2 的mesh
import  { LineGeometry }  from  "three/examples/jsm/lines/LineGeometry" // line的geometry 
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'; // line2的材质
import { CSS3DObject } from'three/examples/jsm/renderers/CSS3DRenderer.js';

if (!THREE) {
  throw new Error("你没有安装three.js， 请安装后在使用");
}

if (!gsap) {
  throw new Error("你没有安装gsap.js， 请安装后在使用");
}

let siginArr = []

/*
  @params {array} pointArr :标点的数组，用于根据点位生成线段
  @params {boolean} starting : 判断是否正在画线
  @params {number} tweenPointIndex: 补间的时候判断的索引
  @params {array} tweenPointArr :标点的数组，用于根据点位生成线段
*/

export class drawRoute {
    constructor (option) {
      this.starting = false; // 是否正在进行补间插值

      this.tweenPointArr = []; // 路径的点

      this.tweenPointIndex = 0;

      this.scene = option.scene;
      this.camera = option.camera;
      this.control = option.control;
      this.pointArr = option.pointArr; // 标点位置的数组
      this.isClickAdd = false; // 是否通过标点生成数据

      // 跟着路径走的标记

      if (this.pointArr.length > 1) {
        this.createLine();
      }

    }

    // 添加线
    createLine () {

      this.lineMaterial = new LineMaterial({
        color: "#fff",
        linewidth: 6,
        transparent: true
      })

      let point = new THREE.Vector3(this.pointArr[0].x, this.pointArr[0].y, this.pointArr[0].z);

      this.line = new Line2(new LineGeometry().setPositions(point), this.lineMaterial);
      this.line.computeLineDistances();
      this.line.frustumCulled = false;

      this.line.position.y += 1;

      if (!this.isClickAdd && !this.oldClickAdd) {
        this.scene.add(this.createSign(point));
      }

      this.scene.add(this.line);

    }

    start () {
      this.starting = true;
      this.setPointArr();
    }

    stop () {
      this.starting = false;
    }

    reset () {
      this.tweenPointArr = [];
      this.starting = true;
      this.tweenPointIndex = 0;

      siginArr.forEach(item => {
        
        item.traverse(item => {
          if (item.isCSS3DObject) {
            // 移除dom元素
            item.element.remove();
          };

          if (item.material && item.geometry) {
            item.material = null;
            item.geometry = null;
          }
          this.scene.remove(item);;

        });
        this.scene.remove(item);

      });

    }

    createSign (point) {

      if (!point) {
        return;
      }

      let getClickSign = point.clone();

      // 生成CSS样式
      let oDiv = document.createElement("div");
      oDiv.innerHTML = this.signInfor;
      oDiv.className = "sign-infor";
      oDiv.style.cssText = `
        box-sizing: border-box;
        font-size: 12px; 
        background-color:rgba(255,255,255, 0.6);
        border:1px solid #ff5722;
        padding: 2px 4px;`
      let css3Obj = new CSS3DObject(oDiv);
      css3Obj.position.y += 10;
      css3Obj.scale.set(0.2,0.2,0.2);

      // 点击标签让相机移动到当前标签位置
      css3Obj.element.onpointerdown = (e => {

        let timeLine = gsap.timeline();
      // 动画补间
      this.control.enbled = false;
      timeLine.to(this.control.target, {
        duration: 1,
        ease: "slow",
        x:  getClickSign.x,
        y:  getClickSign.y ,
        z:  getClickSign.z,
      }).to(this.camera.position, {
        duration: 1,
        ease: "slow",
        x:  getClickSign.x +50,
        y:  getClickSign.y + 50,
        z:  getClickSign.z  + 50,
        onComplete: () => {
          this.control.enbled = true
        }
        })

      })
        
      //生产倒立的圆锥当作标记点
      const geometry = new THREE.ConeGeometry( 2, 10, 16 );
      const material = new THREE.MeshBasicMaterial( {color: 0xffff00,side: 0} );
      geometry.rotateX(Math.PI);
      const cone = new THREE.Mesh( geometry, material );
      
      let tempGroup = new THREE.Group();
      tempGroup.add(cone);
      tempGroup.add(css3Obj);

      tempGroup.position.x = point.x;
      tempGroup.position.z = point.z;

      tempGroup.position.y -= 40;

      siginArr.push(tempGroup);

      setInterval(() => {
        css3Obj.element.innerHTML = `当前温度：${Math.floor(Math.random() * 50)}°`;
      }, 1000)

      return tempGroup

    }

    setPointArr () {

      if (!this.pointArr[this.tweenPointIndex + 1]) {
        return;
      }
      
      const nextPoint = new THREE.Vector3(
        this.pointArr[this.tweenPointIndex + 1].x,
        this.pointArr[this.tweenPointIndex + 1].y,
        this.pointArr[this.tweenPointIndex + 1].z);

      const currentPoint = new THREE.Vector3(
        this.pointArr[this.tweenPointIndex].x,
        this.pointArr[this.tweenPointIndex].y,
        this.pointArr[this.tweenPointIndex].z);
      
      gsap.to(currentPoint, {
        x: nextPoint.x,
        y: nextPoint.y,
        z: nextPoint.z,
        duration: 1.5,
        onUpdate: () => {

          this.camera.lookAt(currentPoint);
          this.control.target = currentPoint;

          this.tweenPointArr.push(currentPoint.x, currentPoint.y, currentPoint.z);
          let tempGeo = new LineGeometry();

          this.line.geometry = tempGeo.setPositions( this.tweenPointArr );

          this.line.computeLineDistances();
          this.line.material.resolution.set( window.innerWidth, window.innerHeight );

        },
        onComplete: () => {
        
          
          if (this.oldClickAdd && this.pointArr.length >= 2) {
            console.log(1);
            this.scene.add(this.createSign(nextPoint));

          } else {
            console.log(2);
            this.scene.add(this.createSign(currentPoint));

          }
          localStorage.setItem("testArr", JSON.stringify(this.pointArr))

          if (this.tweenPointIndex < this.pointArr.length - 2) {

            this.tweenPointIndex++;

            this.setPointArr();

          } else {

            this.tweenPointIndex++;
            this.starting = false;

          }
        }
      });
    }
    
    repeat () {
      this.tweenPointIndex = 0;
      this.tweenPointArr = [this.tweenPointArr[0], this.tweenPointArr[1],this.tweenPointArr[2]];
      let tempGeo = new LineGeometry();

      this.line.geometry = tempGeo.setPositions( this.tweenPointArr );

      this.line.computeLineDistances();
      this.line.material.resolution.set( window.innerWidth, window.innerHeight );
      siginArr.forEach(item => {
        
        item.traverse(item => {
          if (item.isCSS3DObject) {
            // 移除dom元素
            item.element.remove();
          };

          if (item.material && item.geometry) {
            item.material = null;
            item.geometry = null;
          }
          this.scene.remove(item);;

        });
        this.scene.remove(item);

      });
      this.scene.add(this.createSign(new THREE.Vector3(this.tweenPointArr[0], this.tweenPointArr[1],this.tweenPointArr[2])));
      this.setPointArr();
    }

    update () {

      if (this.starting) {
        return;
      };

      if (this.pointArr.length) {

        if (this.pointArr.length === 1 && this.isClickAdd) {

          this.scene.add(this.createSign(this.pointArr[0]));

          this.isClickAdd = false;
          this.oldClickAdd = true;
          
        }
        if (!this.line && this.pointArr.length > 1) {

          this.createLine();
          
          this.setPointArr();
  
          return
  
        }
        if ( this.pointArr.length > 2  && this.pointArr.length -1 !== this.tweenPointIndex ) {
          this.starting = true;
          this.setPointArr();
        }
      }

    }

}