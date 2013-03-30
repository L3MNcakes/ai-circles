/**

THIS IS SHIT - GO AWAY!!!
var stage;
var layers = new Array();
var agents = new Array();
var foods = new Array();
var numFrames = 0;

window.onload = function() {
    set_up_stage(config.container, config.width, config.height);
    set_up_layers();
    spawn_agents(config.num_agents, layers[0]);
    spawn_food(config.start_food, layers[1]);
    draw();
    setInterval(update, 1000);
}

function set_up_stage(c, w, h) {
    stage = new Kinetic.Stage({
        container: c,
        width: w,
        height: h
    });
}

function set_up_layers() {
    layers.push(new Kinetic.Layer()); // Agent Layer
    layers.push(new Kinetic.Layer()); // Food Layer
}

function spawn_agents(num, layer) {
    for(i=0;i<num;i++){
        agent = new Agent();
        agent.randomify();
        agent.buildRes();
        agents.push(agent);
        layer.add(agent.res);
    }
}

function spawn_food(num, layer) {
    for(i=0;i<num;i++) {
        food = new Food();
        food.randomify();
        food.buildRes();
        foods.push(food);
        layer.add(food.res);
    }
}

function draw() {
    len = layers.length;
    for(i=0;i<len;i++) {
        stage.add(layers[i]);
    }
}

function update() {
    numFrames = numFrames + 1;
    len = agents.length;
    layers[0].clear();
    for(i=0;i<len;i++) {
        agents[i].update();
    }
    stage.clear();
    draw();
}

function Agent() {
/**
    this.res;
    this.anim;

    this.color;
    this.strength;
    this.speed;
    this.min_food;
    this.lifespan;
    this.min_mating;
    this.search_radius;

    this.has_food;
    this.can_mate;
    this.has_lived;

    this.decision;
    this.destinationX;
    this.destinationY;
    **/
}

Agent.prototype.randomify = function() {
    this.color = get_random_color();
    this.strength = Math.round(Math.random() * 100);
    this.speed = Math.round(Math.random() * 100);
    this.min_food = Math.round(Math.random() * 100);
    this.lifespan = Math.round(Math.random() * 100);
    this.min_mating = Math.round(Math.random() * 100);
    this.search_radius = Math.round(Math.random() * 100) + 25;
    if(this.search_radius > 100) this.search_radius = 100;
    if(this.min_mating < this.min_food) {
        tmp = this.min_food;
        this.min_food = this.min_mating;
        this.min_mating = tmp;
    }

    this.has_food = 0;
    this.can_mate = false;
    this.has_lived = 0;

    this.decision = "";
    this.destinationX = null;
    this.destinationY = null;
}

Agent.prototype.buildRes = function() {
    this.res = new Kinetic.Circle({
        x: Math.round(Math.random() * config.width + 10),
        y: Math.round(Math.random() * config.height + 10),
        radius: Math.round(this.strength / 4),
        fill: this.color,
        stroke: 'black',
        strokeWidth: 2
    });
}

Agent.prototype.update = function () {
    if(numFrames % (60) == 0) {
        this.decide();
    } else {
        switch(this.decision) {
            case "search for food":
            default:
                this.search_for_food();
        }
    }

    layers[0].add(this.res);
}

Agent.prototype.decide = function() {
    if(typeof this.anim == Kinetic.Animation) this.anim.stop();
    if(this.min_mating > this.has_food) {
        if(this.min_food > this.has_food) {
            this.decision = "search for food";
        }
    }
}

Agent.prototype.search_for_food = function() {
    search_space = {
        "min_x": this.res.getX() - this.search_radius,
        "max_x": this.res.getX() + this.search_radius,
        "min_y": this.res.getY() - this.search_radius,
        "max_y": this.res.getY() + this.search_radius
    }

    len = foods.length;
    possibleFood = new Array();
    for(i=0;i<len;i++) {
        if(foods[i].res.getX() > search_space.min_x && foods[i].res.getX() < search_space.max_x) {
            if(foods[i].res.getY() > search_space.min_y && foods[i].res.getY() < search_space.max_y) {
                possibleFood.push(i);
            }
        }

        if(possibleFood.length == 3) {
            break;
        }
    }

    if(possibleFood.length == 0) {
        this.move_max_random();
    } else {
        this.move_max_random();
    }
}

Agent.prototype.move_max_random = function() {
    if(this.destinationX == null || this.destinationY == null) {
        rand = Math.floor(Math.random() * 3);
        switch(rand) {
            case 0:
                this.destinationX = this.res.getX() + (this.speed * 5);
                this.destinationY = this.res.getX() + (this.speed * 5);
                break;
            case 1:
                this.destinationX = this.res.getX() - (this.speed * 5);
                this.destinationY = this.res.getY() - (this.speed * 5);
                break;
            case 2:
                this.destinationX = this.res.getX() + (this.speed * 5);
                this.destinationY = this.res.getY() - (this.speed * 5);
                break;
            case 3:
                this.destinationX = this.res.getX() - (this.speed * 5);
                this.destinationY = this.res.getY() + (this.speed * 5);
                break;
        }
    }

    this.res.setX(this.res.getX() + (this.destinationX - this.res.getX()));
    this.res.setY(this.res.getY() + (this.destinationY - this.res.getY()));
}

function get_random_color() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

function Food() {
    this.res;
    this.x;
    this.y;
}

Food.prototype.randomify = function() {
    this.x = Math.round(Math.random() * config.width);
    this.y = Math.round(Math.random() * config.height);
}

Food.prototype.buildRes = function() {
    this.res = new Kinetic.RegularPolygon({
        x: this.x,
        y: this.y,
        sides: 7,
        radius: 10,
        fill: 'white',
        stroke: 'red',
        strokeWidth: 2
    });
}
 **/
