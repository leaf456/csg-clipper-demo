var csg = {}
let ctx
let canvas
const idLength = 10
const pointInPolygon = function (polygon, point) {
    //A point is in a polygon if a line from the point to infinity crosses the polygon an odd number of times
    let odd = false;
    //For each edge (In this case for each point of the polygon and the previous one)
    for (let i = 0, j = polygon.length - 1; i < polygon.length; i++) {
        //If a line from the point into infinity crosses this edge
        if (((polygon[i][1] > point[1]) !== (polygon[j][1] > point[1])) // One point needs to be above, one below our y coordinate
            // ...and the edge doesn't cross our Y corrdinate before our x coordinate (but between our x coordinate and infinity)
            && (point[0] < ((polygon[j][0] - polygon[i][0]) * (point[1] - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0]))) {
            // Invert odd
            odd = !odd;
        }
        j = i;

    }
    //If the number of crossings was odd, the point is in the polygon
    return odd;
};
function followPoint(x, y, direction, distance) {
  // Convert direction from radians to degrees
  var angle = direction * (180/Math.PI);
  
  // Calculate the new position
  var newX = x + (distance * Math.cos(direction));
  var newY = y + (distance * Math.sin(direction));
  
  // Return the new position as an object
  return {x: newX, y: newY};
}
function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

csg.toInternalFormat = function(cords) {
	let result = {points: {}, lines: [], isLeaf456csgInternalFormat: true}
	let firstPoint = ""
	let lastPoint = ""
	for (let i in cords) {
		let uid = makeid(idLength)
		result.points[uid] = [cords[i][0] + Math.random() / 100, cords[i][1] + Math.random() / 100]
		if (i == 0) {
			firstPoint = uid
		}
		if (i > 0) {
			//firstpoint, lastpoint, special, ???, shoulddelete
			result.lines.push([uid, lastPoint, false, 0, false])
		}
		lastPoint = uid
	}
	result.lines.push([firstPoint, lastPoint, false, 0, false])
	return result
}
csg.lineIntersects = function (a,b,c,d,p,q,r,s) {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
};
csg.internalRender = function(internalFormat, context) {
	if (internalFormat.isLeaf456csgInternalFormat) {
		for (let i in internalFormat.lines) {
			let start = internalFormat.points[internalFormat.lines[i][0]]
			let end = internalFormat.points[internalFormat.lines[i][1]]
			context.beginPath()
			//context.strokeStyle = internalFormat.lines[i][2] ? "green" : "red"
			let r = parseInt(i) % 6 + 1
			context.strokeStyle = r < 1 ? "blue" : (r < 2 ? "green" : (r < 3 ? "red" : (r < 4 ? "purple" : (r < 5 ? "orange" : "black"))))
			context.moveTo(start[0], start[1])
			context.lineTo(end[0], end[1])
			context.stroke()
		}
		context.beginPath()
		for (let i in internalFormat.points) {
			context.fillRect(internalFormat.points[i][0] - 1, internalFormat.points[i][1] - 1, 2, 2)
		}
		context.fillText("move your mouse", 400, 400)
		context.fillText("reload to reset mouse anchor", 400, 420) //nice
		context.stroke()
	}
}
csg.internalSplit = function(internal) {
	return original
}
csg.intersect = function(x1, y1, x2, y2, x3, y3, x4, y4) {
  // Check if none of the lines are of length 0
	if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
		return false
	}
	denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
  // Lines are parallel
	if (denominator === 0) {
		return false
	}
	let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
	let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator
  // is the intersection along the segments
	if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
		return false
	}
  // Return a object with the x and y coordinates of the intersection
	let x = x1 + ua * (x2 - x1)
	let y = y1 + ua * (y2 - y1)
	return [x, y]
}
csg.internalPointInShape = function(pointX, pointY, shape) {
	let intersections = 0
	for (let i in shape.lines) {
		if (csg.lineIntersects(-10000, 0, pointX, pointY, shape.points[shape.lines[i][0]][0], shape.points[shape.lines[i][0]][1], shape.points[shape.lines[i][1]][0], shape.points[shape.lines[i][1]][1])) {
			intersections++
		}
	}
	return intersections % 2 == 1
}
csg.determineDistances = function(pointX, pointY, arrayOfCollisions, points) {
	for (let i in arrayOfCollisions) {
		var a = pointX - points[i][0]
		var b = pointY - points[i][1];
		var c = Math.sqrt( a*a + b*b );
		arrayOfCollisions[i] = c
	}
}
csg.feedClosestSpecialPoint = function(array) {
	let closest = 100000000000000 //The solution to all problems: a big number. Increase if nessecary
	let id = ""
	for (let i in array) {
		if (array[i] < closest) {
			closest = array[i]
			id = i
		}
	}
	return id
}
csg.negate = function(shape, negative) {
	let current = structuredClone(shape)
	let linesToBeClipped = []
	for (let i in current.lines) {
		for (let x in negative.lines) {
			let shape1point1 = current.points[current.lines[i][0]]
			let shape1point2 = current.points[current.lines[i][1]]
			let shape2point1 = negative.points[negative.lines[x][0]]
			let shape2point2 = negative.points[negative.lines[x][1]]
			if (csg.lineIntersects(shape1point1[0], shape1point1[1], shape1point2[0], shape1point2[1], shape2point1[0], shape2point1[1], shape2point2[0], shape2point2[1])) {
				current.lines[i][2] = true
				current.lines[i][4] = true
				current.lines[i][3]++
				let intersect = csg.intersect(shape1point1[0], shape1point1[1], shape1point2[0], shape1point2[1], shape2point1[0], shape2point1[1], shape2point2[0], shape2point2[1])
				linesToBeClipped.push({"lineNum": i, "intersection": intersect, "startPointId": current.lines[i][0], "endPointId": current.lines[i][1]})
			}
		}
		//if a line doesn't touch any lines and both points are inside the shape, delete it.
		let shape1point1 = current.points[current.lines[i][0]]
		let shape1point2 = current.points[current.lines[i][1]]
		if (csg.internalPointInShape(shape1point1[0], shape1point1[1], negative) && csg.internalPointInShape(shape1point2[0], shape1point2[1], negative)) {
			current.lines[i][4] = true
		}
	}
	//split lines into segments based on if they're inside the shape
	//I barely understand the following code and have no idea how I wrote it
	//It was at this moment that he knew, he messed up
	let linesWithPoints = {}
	for (let i in linesToBeClipped) {
		let newID = makeid(idLength)
		current.points[newID] = linesToBeClipped[i].intersection
		let starterPointForTest = current.points[linesToBeClipped[i].startPointId]
		let isLineInsideShape = csg.internalPointInShape(starterPointForTest[0], starterPointForTest[1], negative)
		if (linesWithPoints[linesToBeClipped[i].lineNum] == null) {
			linesWithPoints[linesToBeClipped[i].lineNum] = {"intersectionIds": {}, "startPointId": linesToBeClipped[i].startPointId, "startPointInsideShape": isLineInsideShape, "endPointId": linesToBeClipped[i].endPointId}
		}
		linesWithPoints[linesToBeClipped[i].lineNum].intersectionIds[newID] = 0
	}
	for (let i in linesWithPoints) {
		let isSolid = !linesWithPoints[i].startPointInsideShape
		let lastId = linesWithPoints[i].startPointId
		let keys = Object.keys(linesWithPoints[i].intersectionIds)
		csg.determineDistances(current.points[lastId][0], current.points[lastId][1], linesWithPoints[i].intersectionIds, current.points)
		for (let z = 0; z < keys.length; z++) {
			let x = csg.feedClosestSpecialPoint(linesWithPoints[i].intersectionIds)
			if (isSolid) {
				current.lines.push([x, lastId, false, 0, false])
			}
			lastId = x
			isSolid = !isSolid
			delete linesWithPoints[i].intersectionIds[x]
		}
		if (isSolid) {
			current.lines.push([linesWithPoints[i].endPointId, lastId, false, 0, false])
		}
	}
	current.lines = current.lines.filter(item => !(item[4]))
	return current
}
let examplepolygon1 = [
	[100, 100],
	[100, 200],
	[200, 200],
	[180, 150]
]
let examplepolygon2 = [
	[130, 140],
	[130, 280],
	[300, 280],
	[300, 140]
]
function degrees_to_radians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}
function line_intersect(x1, y1, x2, y2, x3, y3, x4, y4)
{
    var ua, ub, denom = (y4 - y3)*(x2 - x1) - (x4 - x3)*(y2 - y1);
    if (denom == 0) {
        return null;
    }
    ua = ((x4 - x3)*(y1 - y3) - (y4 - y3)*(x1 - x3))/denom;
    ub = ((x2 - x1)*(y1 - y3) - (y2 - y1)*(x1 - x3))/denom;
    return {
        x: x1 + ua * (x2 - x1),
        y: y1 + ua * (y2 - y1),
        seg1: ua >= 0 && ua <= 1,
        seg2: ub >= 0 && ub <= 1
    };
}
function newstart() {
	
	let internal1 = csg.toInternalFormat(examplepolygon1)
	let internal2 = csg.toInternalFormat(examplepolygon2)
	internal1 = csg.negate(internal1, internal2)
	ctx.lineWidth = 2
	csg.internalRender(internal1, ctx)
	csg.internalRender(internal2, ctx)
	
	
}
function initiate() {
	canvas = document.getElementById("canvas")
	ctx = canvas.getContext("2d")
	newstart()
}
document.addEventListener("mousemove", function(e) {
	examplepolygon2[0][0] += e.movementX
	examplepolygon2[0][1] += e.movementY
	examplepolygon2[1][0] += e.movementX
	examplepolygon2[1][1] += e.movementY
	examplepolygon2[2][0] += e.movementX
	examplepolygon2[2][1] += e.movementY
	examplepolygon2[3][0] += e.movementX
	examplepolygon2[3][1] += e.movementY
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	newstart()
})