const { createCanvas } = require('canvas');

const SIZE = 1000;
const RUNTIME = 240;
const FPS = 60;

function dp(x){
  const out = [];
  for(let i=0;i<x.length-1;i++) {
    out.push(x[i]);
    out.push(arguments[i+1].toFixed(2));
  }
  out.push(x[x.length-1]);
  return out.join('');
}


function positions(t,a,b,c,d) {
  const e = (2*a+b)/3;
  const f = (2*a+c)/3;
  const g = (a+2*b)/3;
  const h = (a+2*c)/3;
  const k = (1-t)*(2*b+c)/3 + t*(b+2*d)/3;
  const l = (1-t)*(b+2*c)/3 + t*(c+2*d)/3;
  const i = (1-t)*k + t*(b+k)/2;
  const j = (1-t)*l + t*(c+l)/2;
  const s1 = (2*a+d)/3;
  const s2 = (e+k)/2;
  const s3 = (f+l)/2;
  const s4 = (a+2*d)/3;
  const t1 = (g+h)/2;
  const m = (1-t)*(e+f)/2 + t*s1;
  const n = (1-t)*(e+t1)/2 + t*s1;
  const o = (1-t)*(f+t1)/2 + t*s1;
  const p = (1-t)*t1 + t*s2;
  const q = (1-t)*t1 + t*s3;
  const r = (1-t)*(g+i)/2 + t*s2;
  const s = (1-t)*(h+j)/2 + t*s3;
  const u = (1-t)*t1 + t*s4;
  return {
    points: {a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,u},
    polys: [
      [a,f,m,e],
      [e,n,p,g],
      [e,m,f,o,q,u,p,n],
      [f,h,q,o],
      [b,g,r,i],
      [g,p,u,k,i,r],
      [u,l,d,k],
      [u,q,h,s,j,l],
      [h,c,j,s]
    ]
  }
}

function coords(t) {
  const [ax,ay] = [Math.cos(0),Math.sin(0)];
  const [bx,by] = [Math.cos(Math.PI*2/3),Math.sin(Math.PI*2/3)];
  const [cx,cy] = [Math.cos(Math.PI*4/3),Math.sin(Math.PI*4/3)];
  const [dx,dy] = [(bx+cx)/2, (by+cy)/2];
  const xs = positions(t,(1-t)*ax+t, (1-t)*bx, (1-t)*cx, (1-t)*dx-t);
  const ys = positions(t,0, (1-t)*by+t, (1-t)*cy-t, 0);
  const points = {};
  Object.entries(xs.points).forEach(([k,x])=>{points[k] = {x:x, y:ys.points[k]}});
  const polys = xs.polys.map((px,i)=>px.map((x,j)=>{return {x:x,y:ys.polys[i][j]}}));
  return {points,polys};
}

function polypath(points) {
  const s = dp`M ${points[0].x} ${points[0].y} `+points.slice(1).map(p=>dp`L ${p.x} ${p.y}`).join(' ')+' z';
  return s;
}

function lerp(a,b,t) {
  return (1-t)*a+t*b;
}
function golden(k,m,i) {
  return ((1+Math.sqrt(5))/2 * k * i) % m;
}

function make_background(svg) {
  const box = svg.viewBox.baseVal;
  const background = document.createElementNS(svg.namespaceURI,'rect');
  svg.appendChild(background);
  background.setAttribute('x',box.x);
  background.setAttribute('y',box.y);
  background.setAttribute('width',box.width);
  background.setAttribute('height',box.height);
  background.style['fill'] = 'white';
}

function ease_cubicinout(t) {
  return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
}

function compose(a,b) {
  return a.map(x=>b[x]);
}

class Scene {
  constructor(pause_time=0.05,ease=ease_cubicinout) {
    this.ease = ease;
    const num_moves = 4;
    const move_time = 1/num_moves-pause_time;

    this.keyframes = [
      {t:0.00, squidge: 0, rot: 0},
      {t:move_time, squidge: 1, rot: 0},
      {t:move_time+pause_time, squidge: 1, rot: 0},
      {t:2*move_time+pause_time, squidge: 1, rot: 90,perm:[4,5,2,1,6,7,8,3,0]},
      {t:2*move_time+pause_time, squidge: 1, rot: 0},
      {t:2*move_time+2*pause_time, squidge: 1, rot: 0},
      {t:3*move_time+pause_time, squidge: 0, rot: 0},
      {t:3*move_time+2*pause_time, squidge: 0, rot: 0},
      {t:4*move_time+2*pause_time, squidge: 0, rot: 120,perm:[4,6,5,1,8,7,3,2,0]},
      {t:4*move_time+2*pause_time, squidge: 0, rot: 0},
      {t:1.00, squidge: 0, rot: 0}
    ]
  }
  
  draw(canvas,size,t,rot,perm) {
    const ctx = canvas.getContext('2d');

    ctx.translate(size/2,size/2);
    ctx.rotate((rot-90)*Math.PI/180);
    ctx.stroke();
    const {points,polys} = coords(t);

    const paths = polys.map((_,j)=>{
      const p = polys[perm[j]];
      const s = j/(polys.length-1);
      const rainbow = golden(360,360,j);
      const hue = 240;
      const sat = lerp(100,0,s);
      const lum = lerp(40,95,s);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 0.05*size/3;
      ctx.lineJoin = 'round';
      ctx.fillStyle = `hsl(${lerp(120,240,s)},60%,45%)`;

      ctx.beginPath();
      ctx.moveTo(p[0].x*size/3,p[0].y*size/3);
      p.slice(1).forEach(c=>ctx.lineTo(c.x*size/3,c.y*size/3));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    })
  }
  
  animate(canvas,size,twt) {
    let perm = [0,1,2,3,4,5,6,7,8]; 
    while(twt>=1) {
      for(let kf of this.keyframes) {
        if(kf.perm) {
          perm = compose(perm,kf.perm);
        }
      }
      twt -= 1;
    }
    const wt = (twt)%1;

    let f;
    for(let i=0;i<this.keyframes.length;i++) {
      const kf = this.keyframes[i];
      if(kf.t>=wt) {
        f = i;
        break;
      } else {
        if(kf.perm) {
          perm = compose(perm,kf.perm);
        }
      }
    }
    let kf1,kf2;
    if(wt==0) {
      kf1 = this.keyframes[this.keyframes.length-1];
      kf2 = this.keyframes[0];
    } else {

      kf1 = this.keyframes[f-1];
      kf2 = this.keyframes[f]
    }
    const t = this.ease((wt-kf1.t)/(kf2.t-kf1.t));
    const squidge = kf1.squidge*(1-t) + kf2.squidge*t;
    const rot = kf1.rot*(1-t) + kf2.rot*t;

    return this.draw(canvas,size,squidge,rot,perm);
  }

}

const scene = new Scene();

function animate(draw,runtime,fps,size,filenamer) {
  const fs = require('fs');
  const frames = Math.ceil(runtime*fps);

  function frame(i) {
    if(i>=frames) {
      return;
    }
    const t = 10*i/(frames-1);
    const canvas = createCanvas(size,size);
    draw(canvas,size,t);
    const filename = filenamer(i,frames);
    console.log(`${i+1}/${frames}`);
    const stream = canvas.createPNGStream();
    const f = fs.createWriteStream(filename);
    stream.pipe(f);
    f.on('finish',()=>frame(i+1));
  }

  frame(0);
}

animate(scene.animate.bind(scene),RUNTIME,FPS,SIZE,i=>`pngs/squiangle-${(i+'').padStart(4,'0')}.png`);
