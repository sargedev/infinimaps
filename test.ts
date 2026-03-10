let placeholder = sprites.create(assets.image`car`, SpriteKind.Player);

let rows: Image[][] = [
    [assets.image`level1`, assets.image`level2`],
    [assets.image`level2`, assets.image`level1`]
]
let current: Image;

let tm = new DynamicTilemap(rows, TileSize.Size16, [
    [assets.image`wallmap1`, image.create(16, 16)],
    [image.create(16, 16), assets.image`wallmap1`]
]);
tm.setColorImage(13,assets.image`tile1`);
tm.setColorImage(11, assets.image`tile2`);
tm.setColorImage(7, assets.image`tile3`);
tm.setColorImage(5, assets.image`tile4`);

let render = new DTRenderer(tm, placeholder);
controller.moveSprite(placeholder, 100, 100);

game.onUpdate(() => {
    console.logValue("tileX", placeholder.x / tm.tileSize);
    console.logValue("tileY", placeholder.y / tm.tileSize);
})

/**
 * TO DO LIST
 * animated tiles
 * walls
 * figure out more tiles somehow
 * colormap for each segment
 * any size tilemap support
 * source from actual tilemaps? (hotswapping)
 * tilemap generation on the fly (adding tilemaps into renderer on runtime)
 * layers with different colormaps & z position
 * 
 * BLOCKS
 * set tilemap to
 * on sprite of kind overlaps
 * on sprite of kind hits wall
 * place mysprite on location
 * place mysprite on random tile
 * set tile at location
 * set wall at location
 * tilemap location
 * tilemap location of sprite
 * location row/column
 * some checks and stuff
 * array of all tile locations
 * 
 * OPTIMIZATION
 * skip rendering if position and tilemap are the same
 * grab tile only when tile that's being rendered changes
 * shift existing pixels instead of redrawing everything
 * automated testing and performance scores
 * if tile is empty try to immediately set transparent pixel instead of returning whole tile and using getpixel
 * wall rendering
 * 
 */