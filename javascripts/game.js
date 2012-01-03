Game = {};
Game.gravity = new Box2D.Common.Math.b2Vec2(0, 10);
Game.world   = new Box2D.Dynamics.b2World(Game.gravity, true);

Game.initialise = function(){
  Input.initialise();
  Game.createBoundaryWalls();
  // Game.createRandomObjects();
  Game.createTerrain();
  Game.createTank();
  Game.setupDebugDraw();
  Mouse.addEventListeners();
  window.setInterval(Game.update, 1000 / 60);
};

Game.createTank = function(){
  var base_height = 140.0;

  var ptm_ratio = 10;

  var b2Vec2 = Box2D.Common.Math.b2Vec2;

  var vertexes = [
    [
      new b2Vec2(75.0/ptm_ratio, (base_height+5.0)/ptm_ratio),
      new b2Vec2(80.0/ptm_ratio, (base_height+10.0)/ptm_ratio),
      new b2Vec2(50.0/ptm_ratio, (base_height+10.0)/ptm_ratio),
      new b2Vec2(55.0/ptm_ratio, (base_height+5.0)/ptm_ratio)
    ],
    [
      new b2Vec2(83.0/ptm_ratio, (base_height+18.0)/ptm_ratio),
      new b2Vec2(47.0/ptm_ratio, (base_height+18.0)/ptm_ratio),
      new b2Vec2(42.0/ptm_ratio, (base_height+14.0)/ptm_ratio),
      new b2Vec2(43.0/ptm_ratio, (base_height+10.0)/ptm_ratio),
      new b2Vec2(87.0/ptm_ratio, (base_height+10.0)/ptm_ratio),
      new b2Vec2(88.0/ptm_ratio, (base_height+14.0)/ptm_ratio)
    ],
    [
      new b2Vec2(95.0/ptm_ratio, (base_height+7.0)/ptm_ratio),
      new b2Vec2(95.0/ptm_ratio, (base_height+8.0)/ptm_ratio),
      new b2Vec2(65.0/ptm_ratio, (base_height+8.0)/ptm_ratio),
      new b2Vec2(65.0/ptm_ratio, (base_height+7.0)/ptm_ratio)
    ]
  ];

  var fixDef = new Box2D.Dynamics.b2FixtureDef;
  fixDef.density = 1.0;
  fixDef.friction = 0.5;
  fixDef.restitution = 0.2;
  fixDef.filter.groupIndex = -1;
  fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;

  var bodyDef = new Box2D.Dynamics.b2BodyDef;
  bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
  var body = Game.world.CreateBody(bodyDef)

  createShape(body, fixDef, vertexes);


  createSupportWheel(body, 46.0/ptm_ratio, (base_height+14.0)/ptm_ratio, 0.2);
  createSupportWheel(body, 55.0/ptm_ratio, (base_height+12.8)/ptm_ratio, 0.1);
  createSupportWheel(body, 65.0/ptm_ratio, (base_height+12.8)/ptm_ratio, 0.1);
  createSupportWheel(body, 75.0/ptm_ratio, (base_height+12.8)/ptm_ratio, 0.1);
  createSupportWheel(body, 84.0/ptm_ratio, (base_height+14.0)/ptm_ratio, 0.2);

  Tank.wheels = [
    createTankWheel(body, 50.0/ptm_ratio, (base_height+17.0)/ptm_ratio, 0.2, 5.5),
    createTankWheel(body, 55.0/ptm_ratio, (base_height+17.0)/ptm_ratio, 0.2, 5.5),
    createTankWheel(body, 60.0/ptm_ratio, (base_height+17.0)/ptm_ratio, 0.2, 5.5),
    createTankWheel(body, 65.0/ptm_ratio, (base_height+17.0)/ptm_ratio, 0.2, 5.5),
    createTankWheel(body, 70.0/ptm_ratio, (base_height+17.0)/ptm_ratio, 0.2, 5.5),
    createTankWheel(body, 75.0/ptm_ratio, (base_height+17.0)/ptm_ratio, 0.2, 5.5),
    createTankWheel(body, 80.0/ptm_ratio, (base_height+17.0)/ptm_ratio, 0.2, 5.5)
  ]

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
  bodyDef.position.Set(14.5, 500 / 30 + 1.8);
  Game.world.CreateBody(bodyDef).CreateFixture(fixDef);

  // roof
  bodyDef.position.Set(14.5, -1.8);
  Game.world.CreateBody(bodyDef).CreateFixture(fixDef);

  // wall width
  fixDef.shape.SetAsBox(2, 14);

  // left wall
  bodyDef.position.Set(-1.8, 13);
  Game.world.CreateBody(bodyDef).CreateFixture(fixDef);
  // right wall
  bodyDef.position.Set(36, 13);
  Game.world.CreateBody(bodyDef).CreateFixture(fixDef);
};

Game.createTerrain = function(){
  var fixDef = new Box2D.Dynamics.b2FixtureDef;
  fixDef.density = 1.0;
  fixDef.friction = 0.5;
  fixDef.restitution = 0.2;

  var bodyDef = new Box2D.Dynamics.b2BodyDef;

  bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
  fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
  bodyDef.position.Set(12, 15);
  var hill = [
      new Box2D.Common.Math.b2Vec2(3, 2),
      new Box2D.Common.Math.b2Vec2(-3, 2),
      new Box2D.Common.Math.b2Vec2(0, 0),
      new Box2D.Common.Math.b2Vec2(3, 0)
  ]
  fixDef.shape.SetAsArray(hill)
  Game.world.CreateBody(bodyDef).CreateFixture(fixDef);
  bodyDef.position.Set(19, 12);
  var hill = [
      new Box2D.Common.Math.b2Vec2(7, 4.5),
      new Box2D.Common.Math.b2Vec2(-4, 3),
      new Box2D.Common.Math.b2Vec2(1.5, 0),
      new Box2D.Common.Math.b2Vec2(2, 0)
  ]
  fixDef.shape.SetAsArray(hill)
  Game.world.CreateBody(bodyDef).CreateFixture(fixDef);
}

Game.createRandomObjects = function(){
  for(var i = 0; i < 50; ++i) {
    createCircleBody(0.15, 20, i/2);
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

function createCircleBody(radius, xPosition, yPosition, friction){
  var fixDef = new Box2D.Dynamics.b2FixtureDef;
  fixDef.density = 1.0;
  fixDef.friction = friction || 1;
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

function createRectangle(width, height, xPosition, yPosition, rotation){
  var fixDef = new Box2D.Dynamics.b2FixtureDef;
  fixDef.density = 1.0;
  fixDef.friction = 2.3;
  fixDef.restitution = 0.2;
  fixDef.filter.groupIndex = -1;
  fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
  fixDef.shape.SetAsBox(width, height);

  var bodyDef = new Box2D.Dynamics.b2BodyDef;
  bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
  bodyDef.position.x = xPosition;
  bodyDef.position.y = yPosition;
  if(rotation){ bodyDef.angle = rotation; }

  var body = Game.world.CreateBody(bodyDef)
  body.CreateFixture(fixDef);

  return body;
}

function createSupportWheel(body, x, y, radius){
  wheel = createCircleBody(radius, x, y, 0);
  jointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
  jointDef.Initialize(body, wheel, new Box2D.Common.Math.b2Vec2(x,y));
  Game.world.CreateJoint(jointDef);
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

  function createJoint(body_a, body_b, pos_a, pos_b){
    distanceJointDef = new Box2D.Dynamics.Joints.b2DistanceJointDef();
    distanceJointDef.Initialize(body_a, body_b, pos_a, pos_b);
    distanceJointDef.collideConnected = true;
    Game.world.CreateJoint(distanceJointDef);
  }

  function createChainLength(x, y, count){
    var previous_track_piece;
    var first_track_piece;
    for(var track = 0; track < count; track++){
      track_piece = createRectangle(track_width, track_height, x, y);
      x += offset;
      if(previous_track_piece){
        createJoint(previous_track_piece, track_piece, new b2Vec2(x - track_width*3.5, y), new b2Vec2(x - track_width*3, y));
      }else{
        first_track_piece = track_piece;
      }
      previous_track_piece = track_piece;
    };

    return [first_track_piece, track_piece];
  };

  chain1 = createChainLength(4.5, 15.25, 19);
  chain2 = createChainLength(4.9, 16.05, 15);

  var a = createRectangle(track_width, track_height, 8.18, 16, -0.65);
  createJoint(chain2[1], a, new b2Vec2(8.05, 16.05), new b2Vec2(8.08, 16.05));
  var b = createRectangle(track_width, track_height, 8.37, 15.84, -0.65);
  createJoint(a,b, new b2Vec2(8.25, 15.95), new b2Vec2(8.28, 15.9));
  var c = createRectangle(track_width, track_height, 8.56, 15.68, -0.65);
  createJoint(b,c, new b2Vec2(8.4, 15.8), new b2Vec2(8.5, 15.7));
  var d = createRectangle(track_width, track_height, 8.65, 15.50, 1.6);
  createJoint(c, d, new b2Vec2(8.6, 15.68), new b2Vec2(8.65, 15.6));
  var e = createRectangle(track_width, track_height, 8.60, 15.32, 0.65);
  createJoint(d, e, new b2Vec2(8.65, 15.45), new b2Vec2(8.65, 15.43))
  createJoint(e, chain1[1], new b2Vec2(8.6, 15.28), new b2Vec2(8.45, 15.25));


  var f = createRectangle(track_width, track_height, 4.32, 15.32, -0.65);
  createJoint(chain1[0], f, new b2Vec2(4.38, 15.25), new b2Vec2(4.42, 15.24))
  var g = createRectangle(track_width, track_height, 4.25, 15.50, 1.6);
  createJoint(f, g, new b2Vec2(4.26, 15.38), new b2Vec2(4.25, 15.42));
  var h = createRectangle(track_width, track_height, 4.32, 15.68, 0.65);
  createJoint(g, h, new b2Vec2(4.25, 15.60), new b2Vec2(4.28, 15.65));
  var i = createRectangle(track_width, track_height, 4.51, 15.84, 0.65);
  createJoint(h, i, new b2Vec2(4.38, 15.75), new b2Vec2(4.45, 15.8));
  var j = createRectangle(track_width, track_height, 4.7, 16, 0.65);
  createJoint(i, j, new b2Vec2(4.55, 15.9), new b2Vec2(4.65, 15.95));
  createJoint(j, chain2[0], new b2Vec2(4.75, 16.05), new b2Vec2(4.85, 16.05));
}

Tank = {
  velocity: 7,
  torque: 2.3
};

Tank.moveLeft = function(){
  for(var i = 0; i < Tank.wheels.length; i++){
    Tank.wheels[i].SetAwake(true);
    Tank.wheels[i].m_angularVelocity = -Tank.velocity;
    Tank.wheels[i].m_torque = -Tank.torque;
  };
};

Tank.moveRight = function(){
  for(var i = 0; i < Tank.wheels.length; i++){
    Tank.wheels[i].SetAwake(true);
    Tank.wheels[i].m_angularVelocity = Tank.velocity;
    Tank.wheels[i].m_torque = Tank.torque;
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
