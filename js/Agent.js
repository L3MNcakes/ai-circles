/**
 * Agent
 * @param world World
 */
function Agent(world) { 
    this.color = this.get_random_color();
    this.speed = this.generate_random_number(config.speed_min, config.speed_max);
    this.min_food = this.generate_random_number(config.min_food_min, config.min_food_max);
    this.endurance = this.generate_random_number(config.endurance_min, config.endurance_max);
    this.chance_of_closest = this.generate_random_number(config.chance_of_closest_min, config.chance_of_closest_max);

    this.position = {"x": Math.floor(Math.random() * config.width),
                     "y": Math.floor(Math.random() * config.height)};

    this.destination = {"x": null,
                        "y": null,
                        "orig_x": this.position.x,
                        "orig_y": this.position.y,
                        "type": null};


    this.has_food = 0;
    this.has_mate = false;
    this.mate = null;
    this.generation = 0;
    this.ticks_alive = 0;

    this.res = new Kinetic.Circle({
        x: this.position.x,
        y: this.position.y,
        radius: 10 + (this.generation * 5),
        fill: this.color,
        stroke: 'black',
        strokeWidth: 4,
        opacity: 0.5
    });

    this.text = new Kinetic.Text({
        x: this.position.x,
        y: this.position.y,
        text: this.generation,
        fontSize: 14,
        fontFamily: 'Calibri',
        fill: 'black'
    });
    
    this.world = world;
}

/**
 * Generates a random number
 */
Agent.prototype.generate_random_number = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Returns a random color
 */
Agent.prototype.get_random_color = function() {
    letters = '0123456789ABCDEF'.split('');
    color = '#';
    for (i = 0; i < 6; i++) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

/**
 * Draws the agent to the screen
 */
Agent.prototype.draw = function(layer) {
    this.res.remove();
    this.res.destroy();
    this.text.remove();
    this.text.destroy();
    var stroke = 'black';
    if(this.has_mate === true) {
        var stroke = 'red';
    }

    this.res = new Kinetic.Circle({
        x: this.position.x,
        y: this.position.y,
        radius: 10 + (this.generation * 5),
        fill: this.color,
        stroke: stroke,
        strokeWidth: 4,
        opacity: 0.5
    });

    this.text = new Kinetic.Text({
        x: this.position.x,
        y: this.position.y,
        text: this.generation,
        fontSize: 14,
        fontFamily: 'Calibri',
        fill: 'black'
    });
    
    if(typeof layer !== undefined) {
        layer.add(this.res);
        layer.add(this.text);
    }
}

/**
 * Tells the Agent what to do next
 */
Agent.prototype.update = function() {
    var arrivedX = false;
    var arrivedY = false;
    this.ticks_alive = this.ticks_alive + 1;
    if(this.ticks_alive == 3000) {
        this.ticks_alive = 0;
    }

    if((!this.destination.x || !this.destination.y)) {
        this.make_decision();
    }

    if(this.destination.type == "food") {
        if(this.world.findFoodByCoords(this.destination.x, this.destination.y) === false) {
            this.make_decision();
        }
    }

    if(this.position.x !== this.destination.x) {
        if(Math.abs(this.destination.x - this.position.x) < this.speed / 5) {
            this.position.x = this.destination.x;
        } else {
            direction = (this.destination.x - this.destination.orig_x);
            direction = direction?direction<0?-1:1:0;
            this.position.x = this.position.x + (direction * this.speed / 10)
        }
    } else {
        var arrivedX = true; 
    }

    if(this.position.y !== this.destination.y) {
        if(Math.abs(this.destination.y - this.position.y) < this.speed / 5) {
            this.position.y = this.destination.y;
        } else {
            direction = (this.destination.y - this.destination.orig_y);
            direction = direction?direction<0?-1:1:0;
            this.position.y = this.position.y + (direction * this.speed / 10);
        }
    } else {
        var arrivedY = true;
    }

    if(arrivedX && arrivedY) {
        switch(this.destination.type) {
            case "mate":
                this.do_mate();
                break;
            case "food":
            default:
                this.eat_food();
                break;
        }
    }
}

/**
 * Makes a decision on what to do next
 */
Agent.prototype.make_decision = function() {
    if(this.has_food < this.min_food) {
        var len = this.world.food.length;        
        var min_distance = 9999;
        var min_food = null;
        for(var i=0;i<len;i++) {
            distance = Math.sqrt(Math.pow(this.world.food[i].position.x - this.position.x, 2) + Math.pow(this.world.food[i].position.y - this.position.y, 2));
            if(distance < min_distance) {
                min_distance = distance;
                min_food = i;
            }
        }

        var rand_food = Math.floor(Math.random() * len);
        var get_closest = Math.random() < (1 / 100 - this.chance_of_closest)
        if(get_closest) {
            min_food = min_food;
        } else {
            min_food = rand_food;
        }

        if(min_food !== null) {
            this.destination.orig_x = this.position.x;
            this.destination.orig_y = this.position.y;
            this.destination.x = this.world.food[min_food].position.x;
            this.destination.y = this.world.food[min_food].position.y;
            this.destination.type = "food";
        }
    } else {
        if(!this.has_mate) {
            this.find_mate();
        }
    }
}

/**
 * Eats a food if on top of food
 */
Agent.prototype.eat_food = function() {
    ind = this.world.findFoodByCoords(this.position.x, this.position.y)
    if(ind !== false) {
        this.world.food[ind].res.destroy();
        this.world.food.splice(ind,1);
        this.has_food = this.has_food + 1;
    }
}

/**
 * Locates another Agent to mate with
 */
Agent.prototype.find_mate = function() {
    var len = this.world.agents.length;
    for(var i=0;i<len;i++) {
        if(this.world.agents[i].has_food === this.world.agents[i].min_food && this.world.agents[i].has_mate === false && this.world.agents[i] !== this) {
            this.has_mate = true;
            this.world.agents[i].has_mate = true;
            this.mate = this.world.agents[i];
            this.world.agents[i].mate = this;

            this.destination.orig_x = this.position.x;
            this.destination.orig_y = this.position.y;
            this.destination.x = this.world.agents[i].position.x;
            this.destination.y = this.world.agents[i].position.y;
            this.destination.type = "mate";
            break;
        }
    }
}

/**
 * Perform mating ritual. ;)
 */
Agent.prototype.do_mate = function() {
    gene1 = new Array();
    gene1.push(this.color);
    gene1.push(this.speed);
    gene1.push(this.min_food);
    gene1.push(this.endurance);
    gene1.push(this.chance_of_closest);

    gene2 = new Array();
    gene2.push(this.mate.color);
    gene2.push(this.mate.speed);
    gene2.push(this.mate.min_food);
    gene2.push(this.mate.endurance);
    gene2.push(this.mate.chance_of_closest);

    n = Math.floor(Math.random() * (gene1.length - 1));
    tmpGene1 = gene1.slice(0,n);
    tmpGene2 = gene1.slice(n);
    tmpGene3 = gene2.slice(0,n);
    tmpGene4 = gene2.slice(n);

    newGene1 = tmpGene1.concat(tmpGene4);
    newGene2 = tmpGene3.concat(tmpGene2);

    mutateRandom = Math.random();
    mutateCheck = mutateRandom < config.mutation_chance; 
    if(mutateCheck) {
        newGene1[0] = this.get_random_color();
        newGene1[1] = this.generate_random_number(config.speed_min, config.speed_max);
        newGene1[2] = this.generate_random_number(config.min_food_min, config.min_food_max);
        newGene1[3] = this.generate_random_number(config.endurance_min, config.endurance_max);

        newGene2[0] = this.get_random_color();
        newGene2[1] = this.generate_random_number(config.speed_min, config.speed_max);
        newGene2[2] = this.generate_random_number(config.min_food_min, config.min_food_max);
        newGene2[3] = this.generate_random_number(config.endurance_min, config.endurance_max);

        newSpawnCheck = mutateRandom < config.mutation_chance / 2;
        if(newSpawnCheck) {
            this.world.agents.push(new Agent(this.world));
        }
    }

    this.generation = this.generation + 1;
    this.mate.generation = this.mate.generation + 1;

    this.color = newGene1[0]; 
    this.speed = newGene1[1];
    this.min_food = newGene1[2];
    this.endurance = newGene1[3];
    this.chance_of_closest = newGene1[4];
    this.ticks_alive = 0;

    this.mate.color = newGene1[0];
    this.mate.speed = newGene2[1];
    this.mate.min_food = newGene2[2];
    this.mate.endurance = newGene2[3];
    this.mate.chance_of_closest = newGene2[4];
    this.mate.ticks_alive = 0;

    this.has_mate = false;
    this.mate.has_mate = false;
    this.has_food = 0;
    this.mate.has_food = 0;

    this.destination.x = null;
    this.destination.y = null
    this.mate.destination.x = null;
    this.mate.destination.y = null;
    this.destination.type = null;
    this.mate.destination.type=null;
    this.make_decision();
    this.mate.make_decision();

}
