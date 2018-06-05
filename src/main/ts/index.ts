interface Frame {
    land: number[];
}

let frameBufferSize = 30;

//let land = [0, 0, .4, .4, 0, -.1, -.1, 0, 0, 0, .2, .2];
//let land = [1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
let land: number[] = [];
for( let i=0; i<100; i++ ) {
    land.push(2);
}
let landLength = land.length;
let frameBuffer = new Array<Frame>(frameBufferSize);
frameBuffer[0] = {
    land: land,
};

let vz = .004;
let frameBufferIndex = 0;
let x = 0;
let vx = 0;
let y = 0;
let vy = 0;
let rotation = 0;
let targetRotation = 0;
let z = frameBufferSize - 1;
let f: any = 0;
let prev = 0;
let diff = 0;

let keys: {[_:number]: number} = {};

onkeydown = (e: KeyboardEvent) => {
   keys[e.keyCode] = 1;
}

onkeyup = (e: KeyboardEvent) => {
    keys[e.keyCode] = 0;
}

(f = ((now?: number)=> {

    if( prev ) {
        diff = now - prev;
        let d = diff * .00003;
        if( keys[39] ) {
            vx += d;
        } else if( keys[37] ) {
            vx -= d;
        } else {
            if( vx > 0 ) {
                vx -= d;
                vx = Math.max(0, vx);
            } else {
                vx += d;
                vx = Math.min(0, vx);
            }
        }
        vx = Math.max(-.005, Math.min(.005, vx));
        let evx = vx / (y * Math.PI * 2);
        x += evx * Math.cos(targetRotation);
        if ( x < 0 ) {
            x++;
        }
        y += diff * (vy + evx * Math.sin(targetRotation));
        z += diff * vz;

        rotation = rotation + (targetRotation - rotation) * Math.min(1, diff/500);
    }
    prev = now;

    // populate frames
    let zi = Math.floor(z);
    while( frameBufferIndex != zi ) {
        let previousFrame = frameBuffer[frameBufferIndex%frameBufferSize];
        frameBufferIndex++;

        let newLand;
        newLand = [];
        for( let i=0; i<land.length; i++ ) {
            if( i % 20 > 1 ) {
                newLand.push(2 + (frameBufferIndex % 30)/1000);
            } else {
                newLand.push(2 + 100/1000);
            }
        }

        frameBuffer[frameBufferIndex%frameBufferSize] = {
            land: newLand
        }
    }
    //frameBuffer[(zi+3)%frameBufferSize] = playerFrame;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#000';
    c.fillRect(0, 0, a.width, a.height);
    // draw frames
    let nextFrame = frameBuffer[(zi+1)%frameBufferSize];
    let currentFrame = frameBuffer[zi%frameBufferSize];
    let fz = zi + frameBufferSize;

    let l = landLength * x;
    let li = Math.floor(l);
    let currentDy = currentFrame.land[(li+1)%landLength] - currentFrame.land[li%landLength];
    let currentFloorY = currentFrame.land[li%landLength] + currentDy * (l - li);
    let nextDy = nextFrame.land[(li+1)%landLength] - nextFrame.land[li%landLength];
    let nextFloorY = nextFrame.land[li%landLength] + nextDy * (l - li);
    if( y && nextFloorY - y > .01 && nextFloorY - currentFloorY > .01 ) {
        // dead, no request animation frame
    } else {
        requestAnimationFrame(f);
        currentFloorY += .01;
        if( currentFloorY >= y ) {
            y = currentFloorY;
            vy = 0;
            targetRotation = Math.atan2(currentDy, Math.PI * currentFloorY * 2/landLength);    

        } else {
            vy -= diff * .0000005;
        }
    }
    if( isNaN(targetRotation) ) {
        console.log('fuck');
    }
    let i;
    do {
        i = fz % frameBufferSize;
        let frame = frameBuffer[i];
        let dz = fz - z;
        fz--;
        // most distant frame takes up the entire screen width, closer only shown partially
        let s = a.width * frameBufferSize/dz;
        let land = frame.land;


        c.setTransform(
            s, 
            0, 
            0, 
            s, 
            a.width/2, 
            a.height/2
        );
        let sin = Math.sin(rotation);
        let cos = Math.cos(rotation);
        c.transform(
            cos, 
            sin, 
            -sin, 
            cos, 
            0, 
            0
        );
        c.transform(
            1, 
            0, 
            0, 
            1, 
            -Math.cos(rotation) * vx * dz, 
            y + Math.sin(rotation) * vx * dz
        );

        //c.fillStyle = `hsl(0, 0%, 90%)`;
        let g = landLength;
        let color = -1;
        c.fillStyle = `hsl(0, 0%, ${(frameBufferSize - dz)/frameBufferSize * (fz%4?100:30)}%)`;
        c.beginPath();
        while( g ) {
            let l = land[--g];
            let a = (g / landLength - x - .25) * Math.PI * 2;
            let lx = Math.cos(a) * l;
            let ly = Math.sin(a) * l;
            c.lineTo(lx, ly);
        }
        c.fill();
        
    } while(fz != zi)

    /*
    c.textBaseline = 'middle';
    c.textAlign = 'center';
    c.setTransform(
        0, 5, -10, 0, a.width/2, a.height*2/3
    );
    c.fillStyle = 'magenta';
    c.fillText('X', 0, 0);
    c.fillStyle = 'red';
    c.fillText('X', 1, 0);
    */
}))();