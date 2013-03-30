function World(num_agents, num_food) {
    this.num_agents = num_agents;
    this.num_food = num_food;
    this.agents = new Array();
    this.food = new Array();
    this.ticks = 0;

    this.stage = new Kinetic.Stage({
        container: config.container,
        width: config.width,
        height: config.height
    });

    this.agent_layer = new Kinetic.Layer();
    this.food_layer = new Kinetic.Layer();

    this.spawn_world();
}

World.prototype.spawn_world = function() {
    for(var i=0;i<this.num_agents;i++) {
        agent = new Agent(this);
        this.agents.push(agent);
    }

    for(var i=0;i<this.num_food;i++) {
        food = new Food();
        this.food.push(food);
    }
}

World.prototype.spawn_more_food = function() {
    for(var i=0;i<this.agents.length/2;i++) {
        food = new Food();
        this.food.push(food);
    }

    len = this.agents.length;
    for(var i=0;i<len;i++) {
        this.agents[i].make_decision();
    }
}

World.prototype.tick = function() {
    if(this.food.length < 10) this.spawn_more_food();
    var len = this.agents.length;
    for(var i=0;i<len;i++) {
        if(this.agents[i] !== undefined) {
            if(this.agents[i].ticks_alive >= this.agents[i].endurance && !this.has_mate) {
                this.agents[i].res.remove();
                this.agents[i].res.destroy();
                this.agents.splice(i,1);
            }
            else {
                this.agents[i].update();
                this.agents[i].draw(this.agent_layer);
            }
        }
    }

    len = this.food.length;
    for(var i=0;i<len;i++) {
        this.food[i].draw(this.food_layer);
    }

    this.agent_layer.remove();
    this.food_layer.remove();
    this.stage.add(this.agent_layer);
    this.stage.add(this.food_layer);
    this.stage.draw();
}

World.prototype.findFoodByCoords = function(x,y) {
    var len = this.food.length;
    for(var i=0;i<len;i++) {
        if(this.food[i].position.x === x && this.food[i].position.y === y) {
            return i;
        }
    }

    return false;
}
