Game = {};
Game.gravity = new Box2D.Common.Math.b2Vec2(0, 10);
Game.world   = new Box2D.Dynamics.b2World(Game.gravity, true);

Game.initialise = function(){
  Input.initialise();
  Game.createBoundaryWalls();
  // Game.createRandomObjects();
  Game.createTank();
  Game.setupDebugDraw();
  Mouse.addEventListeners();
  window.setInterval(Game.update, 1000 / 60);
};

Game.createTank = function(){
  var ptm_ratio = 10;

  var b2Vec2 = Box2D.Common.Math.b2Vec2;

  var vertexes = [
    [
      new b2Vec2(75.0/ptm_ratio, 65.0/ptm_ratio),
      new b2Vec2(80.0/ptm_ratio, 72.0/ptm_ratio),
      new b2Vec2(50.0/ptm_ratio, 72.0/ptm_ratio),
      new b2Vec2(55.0/ptm_ratio, 65.0/ptm_ratio)
    ],
    [
      new b2Vec2(85.0/ptm_ratio, 78.0/ptm_ratio),
      new b2Vec2(45.0/ptm_ratio, 78.0/ptm_ratio),
      new b2Vec2(40.0/ptm_ratio, 74.0/ptm_ratio),
      new b2Vec2(40.0/ptm_ratio, 72.0/ptm_ratio),
      new b2Vec2(90.0/ptm_ratio, 72.0/ptm_ratio),
      new b2Vec2(90.0/ptm_ratio, 74.0/ptm_ratio)
    ]
  ];

  var fixDef = new Box2D.Dynamics.b2FixtureDef;
  fixDef.density = 1.0;
  fixDef.friction = 0.5;
  fixDef.restitution = 0.2;
  fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;

  var bodyDef = new Box2D.Dynamics.b2BodyDef;
  bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
  var body = Game.world.CreateBody(bodyDef)

  createShape(body, fixDef, vertexes);
  // createTankWheel(body, 45.0/ptm_ratio, 75.0/ptm_ratio, 0.25, 5.5);

  Tank.wheels = [
    createTankWheel(body, 50.0/ptm_ratio, 77.0/ptm_ratio, 0.2, 5.5),
    createTankWheel(body, 55.0/ptm_ratio, 77.0/ptm_ratio, 0.2, 5.5),
    createTankWheel(body, 60.0/ptm_ratio, 77.0/ptm_ratio, 0.2, 5.5),
    createTankWheel(body, 65.0/ptm_ratio, 77.0/ptm_ratio, 0.2, 5.5),
    createTankWheel(body, 70.0/ptm_ratio, 77.0/ptm_ratio, 0.2, 5.5),
    createTankWheel(body, 75.0/ptm_ratio, 77.0/ptm_ratio, 0.2, 5.5),
    createTankWheel(body, 80.0/ptm_ratio, 77.0/ptm_ratio, 0.2, 5.5)
  ]
  // createTankWheel(body, 85.0/ptm_ratio, 75.0/ptm_ratio, 0.25, 5.5);

  createTankChain();
};

Game.update = function(){
  Tank.update();
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
  for(var i = 0; i < 100; ++i) {
    createCircleBody(0.1, 10, 10);
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


// [[vertex, vertex, vertex, vertex],[vertex, vertex, vertex]]
function createShape(body, fixtureDefinition, vertexes){
  for(i=0; i < vertexes.length; i++){
    fixtureDefinition.shape.SetAsArray(vertexes[i])
    body.CreateFixture(fixtureDefinition)
  }
}

function createCircleBody(radius, xPosition, yPosition){
  var fixDef = new Box2D.Dynamics.b2FixtureDef;
  fixDef.density = 1.0;
  fixDef.friction = 0.5;
  fixDef.restitution = 0.2;
  fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(radius);

  var bodyDef = new Box2D.Dynamics.b2BodyDef;
  bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
  bodyDef.position.x = xPosition;
  bodyDef.position.y = yPosition;

  var body = Game.world.CreateBody(bodyDef)
  body.CreateFixture(fixDef);

  return body;
}

function createRectangle(width, height, xPosition, yPosition){
  var fixDef = new Box2D.Dynamics.b2FixtureDef;
  fixDef.density = 1.0;
  fixDef.friction = 0.5;
  fixDef.restitution = 0.2;
  fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
  fixDef.shape.SetAsBox(width, height);

  var bodyDef = new Box2D.Dynamics.b2BodyDef;
  bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
  bodyDef.position.x = xPosition;
  bodyDef.position.y = yPosition;

  var body = Game.world.CreateBody(bodyDef)
  body.CreateFixture(fixDef);
  return body;
}


function createTankWheel(body, x, y, radius, force){
  wheel = createCircleBody(radius, x, y);

  lineJointDef = new Box2D.Dynamics.Joints.b2LineJointDef();
  lineJointDef.Initialize(body, wheel, wheel.GetWorldCenter(), new Box2D.Common.Math.b2Vec2(0, 1));

  lineJointDef.lowerTranslation = 0;
  lineJointDef.upperTranslation = 0.1;
  lineJointDef.enableLimit      = true;
  lineJointDef.maxMotorForce    = force;
  lineJointDef.motorSpeed       = 5;
  lineJointDef.enableMotor      = true;

  Game.world.CreateJoint(lineJointDef);
  return wheel;
}

function createTankChain(){

  var b2Vec2 = Box2D.Common.Math.b2Vec2;
  var track_width  = 0.1;
  var track_height = 0.05;
  var offset = track_width * 2.2;

  function createChainLength(x, y, count){
    var previous_track_piece;
    for(var track = 0; track < count; track++){
      track_piece = createRectangle(track_width, track_height, x, y);
      x += offset;
      if(previous_track_piece){
        distanceJointDef = new Box2D.Dynamics.Joints.b2DistanceJointDef();
        distanceJointDef.Initialize(previous_track_piece, track_piece, new b2Vec2(x - track_width*3.5, y), new b2Vec2(x - track_width*3, y));
        distanceJointDef.collideConnected = true;
        Game.world.CreateJoint(distanceJointDef);
      }
      previous_track_piece = track_piece;
    };
  };

  createChainLength(4.8, 12, 17);
  createChainLength(10.8, 2.5, 17);
}

Tank = {
  velocity: 25
};

Tank.moveLeft = function(){
  for(var i = 0; i < Tank.wheels.length; i++){
    Tank.wheels[i].m_angularVelocity = -Tank.velocity;
  };
};

Tank.moveRight = function(){
  for(var i = 0; i < Tank.wheels.length; i++){
    Tank.wheels[i].m_angularVelocity = Tank.velocity;
  };
};

Tank.stop = function(){
  for(var i = 0; i < Tank.wheels.length; i++){
    Tank.wheels[i].m_angularVelocity = 0;
  };
};

Tank.update = function(){
  if(Input.left){
    Tank.moveLeft();
  }else if(Input.right){
    Tank.moveRight();
  }else{
    Tank.stop();
  }
}

Input = { left: false, right: false };

Input.initialise = function(){
  window.addEventListener('keydown', Input.keyDown, false);
  window.addEventListener('keyup', Input.keyUp, false);
}

Input.keyDown = function(event){
  switch(event.keyCode){
    case 37: // left
      Input.left = true;
      break;
    case 39: // right
      Input.right = true;
      break;
  };
};

Input.keyUp = function(event){
  switch(event.keyCode){
    case 37: // left
      Input.left  = false;
      break;
    case 39: // right
      Input.right = false;
      break;
  };
};
