Game = {};
Game.gravity = new Box2D.Common.Math.b2Vec2(0, 9.8);
Game.world   = new Box2D.Dynamics.b2World(Game.gravity, true);

Game.initialise = function(){
  Game.createBoundaryWalls();
  Game.createRandomObjects();
  Game.setupDebugDraw();
  Mouse.addEventListeners();
  window.setInterval(Game.update, 1000 / 60);
};

Game.update = function(){
  Mouse.update();
  Game.world.Step(1 / 60, 10, 10);
  Game.world.DrawDebugData();
  Game.world.ClearForces();
};

Game.createBoundaryWalls = function(){
  var fixDef = new Box2D.Dynamics.b2FixtureDef;
  fixDef.density = 1.0;
  fixDef.friction = 0.5;
  fixDef.restitution = 0.2;

  var bodyDef = new Box2D.Dynamics.b2BodyDef;

  //create ground
  bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
  fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
  fixDef.shape.SetAsBox(20, 2);

  // ground
  bodyDef.position.Set(10, 400 / 30 + 1.8);
  Game.world.CreateBody(bodyDef).CreateFixture(fixDef);

  // roof
  bodyDef.position.Set(10, -1.8);
  Game.world.CreateBody(bodyDef).CreateFixture(fixDef);

  // wall width
  fixDef.shape.SetAsBox(2, 14);

  // left wall
  bodyDef.position.Set(-1.8, 13);
  Game.world.CreateBody(bodyDef).CreateFixture(fixDef);
  // right wall
  bodyDef.position.Set(21.8, 13);
  Game.world.CreateBody(bodyDef).CreateFixture(fixDef);
};

Game.createRandomObjects = function(){
  var fixDef = new Box2D.Dynamics.b2FixtureDef;
  fixDef.density = 1.0;
  fixDef.friction = 0.5;
  fixDef.restitution = 0.2;

  var bodyDef = new Box2D.Dynamics.b2BodyDef;

  //create some objects
  bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
  for(var i = 0; i < 10; ++i) {
    if(Math.random() > 0.5) {
       fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
       fixDef.shape.SetAsBox(
             Math.random() + 0.1 //half width
          ,  Math.random() + 0.1 //half height
       );
    } else {
       fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(
          Math.random() + 0.1 //radius
       );
    }
    bodyDef.position.x = Math.random() * 10;
    bodyDef.position.y = Math.random() * 10;
    Game.world.CreateBody(bodyDef).CreateFixture(fixDef);
  }
};

Game.setupDebugDraw = function(){
  var debugDraw = new Box2D.Dynamics.b2DebugDraw();
  debugDraw.SetSprite(document.getElementById("canvas").getContext("2d"));
  debugDraw.SetDrawScale(30.0);
  debugDraw.SetFillAlpha(0.5);
  debugDraw.SetLineThickness(1.0);
  debugDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit | Box2D.Dynamics.b2DebugDraw.e_jointBit);
  Game.world.SetDebugDraw(debugDraw);
}

Mouse = {
  x            : undefined,
  y            : undefined,
  PVec         : undefined,
  isDown       : undefined,
  selectedBody : undefined,
  joint        : undefined
};

Mouse.update = function(){
  if(Mouse.isDown && (!Mouse.joint)){
    var body = Mouse.getBodyAtMouse();
    if(body){
      var mouseJointDefinition = new Box2D.Dynamics.Joints.b2MouseJointDef();
      mouseJointDefinition.bodyA = Game.world.GetGroundBody();
      mouseJointDefinition.bodyB = body;
      mouseJointDefinition.target.Set(Mouse.x, Mouse.y);
      mouseJointDefinition.collideConnected = true;
      mouseJointDefinition.maxForce = 300.0 * body.GetMass();
      Mouse.joint = Game.world.CreateJoint(mouseJointDefinition);
      body.SetAwake(true);
    }
  }

  if(Mouse.joint){
    if(Mouse.isDown){
      Mouse.joint.SetTarget(new Box2D.Common.Math.b2Vec2(Mouse.x, Mouse.y));
    }else{
      Game.world.DestroyJoint(Mouse.joint);
      Mouse.joint = null;
    }
  }
};

Mouse.handleMove = function(event){
  var canvasPosition = getElementPosition(document.getElementById("canvas"));
  Mouse.x = (event.clientX - canvasPosition.x) / 30;
  Mouse.y = (event.clientY - canvasPosition.y) / 30;
};

Mouse.addEventListeners = function(){
  document.addEventListener("mousedown", function(e) {
    Mouse.isDown = true;
    Mouse.handleMove(e);
    document.addEventListener("mousemove", Mouse.handleMove, true);
  }, true);

  document.addEventListener("mouseup", function() {
    document.removeEventListener("mousemove", Mouse.handleMove, true);
    Mouse.isDown = false;
    Mouse.x = undefined;
    Mouse.y = undefined;
  }, true);
};

Mouse.getBodyCB = function(fixture){
  if(fixture.GetBody().GetType() != Box2D.Dynamics.b2Body.b2_staticBody) {
     if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), Mouse.PVec)) {
        Mouse.selectedBody = fixture.GetBody();
        return false;
     }
  }
  return true;
};

Mouse.getBodyAtMouse = function(){
  Mouse.PVec = new Box2D.Common.Math.b2Vec2(Mouse.x, Mouse.y);
  var environment = new Box2D.Collision.b2AABB();
  environment.lowerBound.Set(Mouse.x - 0.001, Mouse.y - 0.001);
  environment.upperBound.Set(Mouse.x + 0.001, Mouse.y + 0.001);

  // Query the world for overlapping shapes.
  Mouse.selectedBody = null;
  Game.world.QueryAABB(Mouse.getBodyCB, environment);
  return Mouse.selectedBody;
}

//helpers
//http://js-tut.aardon.de/js-tut/tutorial/position.html
function getElementPosition(element) {
  var elem=element, tagname="", x=0, y=0;

  while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
     y += elem.offsetTop;
     x += elem.offsetLeft;
     tagname = elem.tagName.toUpperCase();

     if(tagname == "BODY")
        elem=0;

     if(typeof(elem) == "object") {
        if(typeof(elem.offsetParent) == "object")
           elem = elem.offsetParent;
     }
  }

  return {x: x, y: y};
}
