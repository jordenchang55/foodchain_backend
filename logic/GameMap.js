import { mapTiles } from '../gameConfigs';
import { transformPosition } from '../utils/map';

/**
 * This class records map tiles and other tiles put on the map.
 */
export default class GameMap {
    /**
     * Create game map with give tiles and directions.
     * @param xSize width of whole map.
     * @param ySize height of whole map.
     * @param configs contains tile id and direction which ranges from 0 to 3 indicating rotation of this tile.
     */
    constructor(xSize, ySize, configs) {
        this.internalMap = [];
        for (let row = 0; row < ySize * 5; row += 1) {
            this.internalMap[row] = new Array(xSize * 5).fill(0);
        }

        this.tileConfig = configs.map((config, idx) => ({
            ...config,
            position: {
                xTile: idx % xSize,
                yTile: Math.floor(idx / xSize),
            },
        }));
        this.tileConfig.forEach((config) => {
            const tile = mapTiles[config.tileId];
            const offsetPosition = (positions) => positions?.map((pos) => transformPosition(pos, config.direction))
                .map((pos) => ({ x: pos[0] + config.position.xTile * 5, y: pos[1] + config.position.yTile * 5 }));

            offsetPosition(tile.roads)?.forEach((pos) => {
                this.internalMap[pos.y][pos.x] = 1;
            });
            offsetPosition(tile.crossing)?.forEach((pos) => {
                if (this.internalMap[pos.y][pos.x] === 1) {
                    this.internalMap[pos.y][pos.x] = 3;
                } else {
                    this.internalMap[pos.y][pos.x] = 2;
                }
            });
            tile.drinks?.forEach((drink) => {
                const pos = offsetPosition([drink.position])[0];
                this.internalMap[pos.y][pos.x] = drink.type;
            });
            tile.houseTiles?.forEach((house) => {
                offsetPosition(house.positions).forEach((pos) => {
                    this.internalMap[pos.y][pos.x] = house.tileId;
                });
            });
        });
    }

    getTile(xTile, yTile, xSmall, ySmall) {
        return this.internalMap[yTile * 5 + ySmall][xTile * 5 + xSmall];
    }

    /**
     * Put a new tile onto given positions.
     * @param tileId Indicate which tile to be placed.
     * @param positions An array of 4-d positions corresponding to each cell on that tile.
     * @return Boolean value indicates whether the tile is put on the map successfully or not.
     */
    putTile(tileId, positions) {
        if (positions.every((pos) => this.getTile(pos[0], pos[1], pos[2], pos[3]) === 0)) {
            positions.forEach((pos) => {
                this.internalMap[pos[1] * 5 + pos[3]][pos[0] * 5 + pos[2]] = tileId;
            });
            return true;
        }
        return false;
    }

    /**
     * Remove tiles put on given positions.
     * @param positions An array of 4-d positions corresponding to each cell on that tile.
     */
    removeTile(positions) {
        positions.forEach((pos) => {
            this.internalMap[pos[1] * 5 + pos[3]][pos[0] * 5 + pos[2]] = 0;
        });
    }
}
