window.onload = function() {
    world = new World(config.num_agents, config.start_food);
    
    setInterval(function() { 
        world.tick();
    }, 1000 / 60);
}
