/**
 * Food
 */
function Food() {
    this.position = {"x": Math.floor(Math.random() * config.width),
                     "y": Math.floor(Math.random() * config.height)};
    this.res = new Kinetic.RegularPolygon({
        x: this.position.x,
        y: this.position.y,
        sides: 7,
        radius: 10,
        fill: 'white',
        stroke: 'red',
        strokeWidth: 2
    });
}

/**
 * Draws a Food to the screen
 */
Food.prototype.draw = function(layer) {
    this.res.remove();
    if(typeof layer !== undefined) {
        layer.add(this.res);
    }
}
