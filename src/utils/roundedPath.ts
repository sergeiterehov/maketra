export function roundedPath(context: CanvasRenderingContext2D, cornerRadius: number, ...args: number[] ){
    context.beginPath();

    if (!args.length) return;

    //compute the middle of the first line as start-stop-point:
    var deltaY = (args[3] - args[1]);
    var deltaX = (args[2] - args[0]);
    var xPerY = deltaY / deltaX;
    var startX = args[0] + deltaX / 2;
    var startY = args[1] + xPerY * deltaX / 2;

    //walk around using arcTo:
    context.moveTo(startX, startY);
    var x1, y1, x2, y2;
    x2 = args[2];
    y2 = args[3];
    for (var i = 4; i < args.length; i += 2) {
        x1 = x2;
        y1 = y2;
        x2 = args[i];
        y2 = args[i + 1];
        context.arcTo(x1, y1, x2, y2, cornerRadius);
    }

    //finally, close the path:
    context.arcTo(x2, y2, args[0], args[1], cornerRadius);
    context.arcTo(args[0], args[1], startX, startY, cornerRadius);
    context.closePath();
}
