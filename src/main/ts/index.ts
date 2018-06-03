interface Frame {
    tracks: number[];
    shapes: number[];
    cx: number;
    cy: number;    
}

let frameBufferSize = 102;

let frameBuffer = new Array<Frame>(frameBufferSize);
frameBuffer[0] = {
    tracks: [],
    shapes: [],
    cx: 0, 
    cy: 0
};

let speed = .01;
let frameBufferIndex = 0;
let z = frameBufferSize - 1;
let dy = 0;
let vy = 0;
let f;
let prev: number;
let targetRotation = 0;
let rotation = 0;

c.textAlign = 'center';

window.onkeydown = (e: KeyboardEvent) => {
    let keyCode = e.keyCode;
    if( keyCode == 39 ) {
        // right
        targetRotation += Math.PI/2;
    } else if( keyCode == 37 ) {
        // left
        targetRotation -= Math.PI/2;
    } else {
        if( dy == 0 ) {
            vy = .4;
        }
    }
}

(f = ((now?: number)=> {

    if( prev ) {
        let diff = now - prev;
        z += diff * speed;
        rotation = rotation + (targetRotation - rotation) * Math.min(1, diff/100);
        vy -= diff * .001;
        dy += vy;
        if( dy < 0 ) {
            vy = 0;
            dy = 0;
        }
    }
    prev = now;

    // populate frames
    let zi = Math.floor(z);
    let Z = zi % frameBufferSize;
    while( frameBufferIndex != Z ) {
        let previousFrame = frameBuffer[frameBufferIndex];
        frameBufferIndex = (frameBufferIndex + 1) % frameBufferSize;

        let shapes = [
            // 0, 0, 0, 0, 30, -18, -18, 27, 9, 
            // Math.PI/2, 0, 0, 0, 30, -18, -18, 27, 9, 
            // Math.PI, 0, 0, 0, 30, -18, -18, 27, 9, 
            // 3*Math.PI/2, 0, 0, 0, 30, -18, -18, 27, 9,
        ];
        // add in bricks
        let offset = Math.floor(frameBufferIndex / 4) % 4;
        for( let i=0; i<16; i++ ) {
            if( (frameBufferIndex + Z) % 4 ) {
                shapes.push(
                    Math.PI * i / 8, 0, 0, 0, 40, offset - 4, -13, 5, 4, 

                )
            }
            /*
            shapes.push(
                0, 0, 0, 0, 50, offset - 12, -11, 5, 2, 
                0, 0, 0, 0, 50, offset - 6, -11, 5, 2, 
                0, 0, 0, 0, 50, offset, -11, 5, 2, 
                0, 0, 0, 0, 50, offset + 6, -11, 5, 2, 
                Math.PI/2, 0, 0, 0, 50, offset - 12, -11, 5, 2, 
                Math.PI/2, 0, 0, 0, 50, offset - 6, -11, 5, 2, 
                Math.PI/2, 0, 0, 0, 50, offset, -11, 5, 2, 
                Math.PI/2, 0, 0, 0, 50, offset + 6, -11, 5, 2, 
                Math.PI, 0, 0, 0, 50, offset - 12, -11, 5, 2, 
                Math.PI, 0, 0, 0, 50, offset - 6, -11, 5, 2, 
                Math.PI, 0, 0, 0, 50, offset, -11, 5, 2, 
                Math.PI, 0, 0, 0, 50, offset + 6, -17, 5, 2,
                3*Math.PI/2, 0, 0, 0, 50, offset - 12, -17, 5, 2, 
                3*Math.PI/2, 0, 0, 0, 50, offset - 6, -17, 5, 2, 
                3*Math.PI/2, 0, 0, 0, 50, offset, -17, 5, 2, 
                3*Math.PI/2, 0, 0, 0, 50, offset + 6, -17, 5, 2, 

            );
            */
        }
        if( Math.random() < 0.1 ) {
            shapes.push(
                // rotation 
                Math.floor(Math.random() * 4) * Math.PI/2,
                // char
                65 + Math.floor(Math.random() * 26),
                // hue 
                Math.random() * 360,
                // saturation 
                99,
                // max lightness
                80,
                // x offset (unrotated)
                0,
                // y offset (unrotated) 
                9
            );
        }
        frameBuffer[frameBufferIndex] = {
            tracks: previousFrame.tracks,
            shapes: shapes,
            cx: previousFrame.cx + Math.sin(1 / 10) * 10,
            cy: previousFrame.cy
        }
    }
    //frameBuffer[(zi+3)%frameBufferSize] = playerFrame;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#000';
    c.fillRect(0, 0, a.width, a.height);
    // draw frames
    let currentFrame = frameBuffer[Z];
    let nextFrame = frameBuffer[(Z+1)%frameBufferSize];
    let fz = zi + frameBufferSize;
    let i;
    do {
        i = fz % frameBufferSize;
        let frame = frameBuffer[i];
        let dz = fz - z;
        fz--;
        // we cheat by having the "eye distance" incorporated into the shape sizing (partially - also needs to match the default font size of 10)
        let s = a.height/dz;
        let shapes = frame.shapes;
        let g = 0;

        let dx = currentFrame.cx - frame.cx + (nextFrame.cx - currentFrame.cx)*dz/9;
        let dy = currentFrame.cy - frame.cy + (nextFrame.cy - currentFrame.cy)*dz/9;

        let _dx = dx * Math.cos(rotation) - dy * Math.sin(rotation);
        let _dy = dy * Math.cos(rotation) + dx * Math.sin(rotation);

        while( g < shapes.length ) {
            let localRotation = shapes[g++];
            let type = shapes[g++];
            c.fillStyle = `hsl(${shapes[g++]}, ${shapes[g++]}%, ${shapes[g++] * Math.pow((frameBufferSize - dz)/100, 2)}%)`;
            let sin = Math.sin(rotation + localRotation);
            let cos = Math.cos(rotation + localRotation);
        
            c.setTransform(
                s, 
                0, 
                0, 
                s, 
                a.width/2 + _dx, 
                a.height/2 + _dy
            );
            c.transform(
                // rotate combined player rotation and object rotation
                cos, 
                sin, 
                -sin, 
                cos, 
                0, 
                // player offset from center (y)
                -4
            );
    
            if( type ) {
                c.fillText(String.fromCharCode(type), shapes[g++], shapes[g++]);
            } else {
                c.fillRect(shapes[g++], shapes[g++], shapes[g++], shapes[g++]);
            }

        }
        
    } while(fz != zi)

    requestAnimationFrame(f);
}))();