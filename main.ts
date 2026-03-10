
// DEBUG
game.stats = true;
const SHOW_WALLS = true;

interface ColorMap {
    [key: number]: Image;
}

enum TileSize {
    Size4 = 4,
    Size8 = 8,
    Size16 = 16,
    Size32 = 32
}

interface Tile {
    image: Image;
    wall: boolean;
}

class DynamicTilemap {
    segments: Image[][];
    wallSegments: Image[][];
    tileSize: TileSize;
    emptyTile: Tile;
    colormap: ColorMap;
    segWidth: number;
    segHeight: number;

    constructor(segments: Image[][], tileSize: TileSize=TileSize.Size16, wallSegments?: Image[][], colormap?: ColorMap) {
        this.tileSize = tileSize;
        this.emptyTile = {image: image.create(tileSize, tileSize), wall: false};

        this.setSegments(segments);
        this.setSegments(wallSegments || [], true)
        if (this.colormap) {
            for (let i = 0; i < 16; i++) {
                if (colormap[i] == undefined) continue;

                if (colormap[i].width != this.tileSize || colormap[i].height != this.tileSize) {
                    throw "All tiles must match defined tile size";
                }
            }
            this.colormap = colormap;
            return;
        }

        this.colormap = {};
        for (let i = 0; i < 16; i++) {
            this.colormap[i] = this.emptyTile.image;
        }
    }

    get length(): number {
        return this.segments.length;
    }

    setColorImage(color: number, image: Image) {
        if (image.width != this.tileSize || image.height != this.tileSize) {
            throw "All tiles must match defined tile size";
        }
        this.colormap[color] = image;
    }

    setSegments(segments: Image[][], wall: boolean=false) {
        if (wall && this.segments == undefined) {
            throw "Tilemap must be defined before wall segments";
        }

        if (segments.length == 0) {
            if (wall) this.wallSegments = [];
            else this.segments = [];
            return;
        }

        for (let rowIndex = 0; rowIndex < segments.length; rowIndex++) {
            if (segments[rowIndex].length == 0) {
                if (wall) throw "Wall segments must match tilemap segments";
                throw "Tilemap row cannot be empty";
            }

            for (let colIndex = 0; colIndex < segments[rowIndex].length; colIndex++) {
                if (rowIndex == 0 && colIndex == 0) {
                    this.segWidth = segments[rowIndex][colIndex].width;
                    this.segHeight = segments[rowIndex][colIndex].height;
                } else if (segments[rowIndex][colIndex].width != this.segWidth || segments[rowIndex][colIndex].height != this.segHeight) {
                    if (wall) throw "All wall segments must be of equal size";
                    throw "All tilemap segments must be of equal size";
                }
            }
        }
        
        if (wall) this.wallSegments = segments;
        else this.segments = segments;
    }

    getTile(x: number, y: number): Tile {
        let tileX = Math.floor(x / this.tileSize);
        let tileY = Math.floor(y / this.tileSize);
        let segmentColIndex = Math.floor(tileX / this.segWidth);
        let segmentRowIndex = Math.floor(tileY / this.segHeight);
        if (segmentRowIndex >= this.segments.length) return this.emptyTile;

        let segmentRow = this.segments[segmentRowIndex];
        if (segmentColIndex >= segmentRow.length) return this.emptyTile;

        let segmentCol = segmentRow[segmentColIndex];
        tileX = tileX % this.segWidth;
        tileY = tileY % this.segHeight;
        let tile = this.colormap[segmentCol.getPixel(tileX, tileY)];
        /*if (SHOW_WALLS && this.wallSegments) {
            let wallSegmentCol = this.wallSegments[segmentRowIndex][segmentColIndex];
            if (wallSegmentCol.getPixel(tileX, tileY) != 0) tile.drawTransparentImage(assets.image`wall`, 0, 0);
        }*/
        if (tile == null) return this.emptyTile;
        if (!this.wallSegments) return {image: tile, wall: false};

        let wallSegmentCol = this.wallSegments[segmentRowIndex][segmentColIndex];
        return {image: tile, wall: wallSegmentCol.getPixel(tileX, tileY) != 0};
    }
}

class DTRenderer {
    tilemap: DynamicTilemap;
    mapWidth: number;
    mapHeight: number;
    xStart: number;
    yStart: number;
    xEnd: number;
    yEnd: number;
    offsetX: number;
    offsetY: number;
    renderable: Image;
    sprite: Sprite;
    screen: Sprite;
    entities: Sprite[];

    constructor(tilemap: DynamicTilemap, sprite: Sprite, offsetX: number = 0, offsetY: number = 0) {
        this.tilemap = tilemap;
        this.sprite = sprite;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.renderable = image.create(scene.screenWidth(), scene.screenHeight());
        this.screen = sprites.create(this.renderable);
        this.screen.setFlag(SpriteFlag.RelativeToCamera, true);
        this.screen.z = -1;
        scene.cameraFollowSprite(this.sprite);
        this.entities = [this.sprite];

        game.onUpdate(() => {
            this.drawTilemap();
            this.checkCollisions();
        })
    }

    initialize() {
        this.xStart = this.sprite.x - scene.screenWidth() / 2 + this.offsetX;
        this.yStart = this.sprite.y - scene.screenHeight() / 2 + this.offsetY;
        this.xEnd = this.xStart + scene.screenWidth();
        this.yEnd = this.yStart + scene.screenHeight();
    }

    drawTilemap() {
        let tile: Tile;
        let px, py, color;
        if (this.tilemap.length == 0) return;

        this.initialize();
        for (let x = this.xStart; x < this.xEnd; x++) {
            for (let y = this.yStart; y < this.yEnd; y++) {
                if (x < 0 || y < 0) {
                    this.renderable.setPixel(x - this.xStart, y - this.yStart, 0);
                    continue;
                }

                tile = this.tilemap.getTile(x, y);
                px = Math.floor(x % this.tilemap.tileSize);
                py = Math.floor(y % this.tilemap.tileSize);

                if (SHOW_WALLS && this.tilemap.wallSegments) {
                    
                }

                this.renderable.setPixel(
                    x - this.xStart, y - this.yStart,
                    tile.image.getPixel(px, py)
                );
            }
        }
        this.screen.setImage(this.renderable);
    }

    addEntity(sprite: Sprite) {
        this.entities.push(sprite);
    }

    checkCollisions() {
        for (let i = 0; i < this.entities.length; i++) {
            if (this.entities[i].vx > 0) {
                
            }
            else if (this.entities[i].vx < 0) {

            }
            if (this.entities[i].vy > 0) {

            }
            else if (this.entities[i].vy < 0) {

            }
        }
    }
}