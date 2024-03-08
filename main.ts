//% helper=mapImage
//% blockIdentity="pixelArt._spriteImage"
function img(lits: any, ...args: any[]): Image { return null }

namespace helpers {
    // Parses an arcade-style image string. Invalid characters are simply ignored
    export function mapImage(value: string) {
        const values: number[][] = [];

        let currentRow = 0;
        let currentCol = 0;
        let width = 0;

        for (let i = 0; i < value.length; i++) {
            const current = value.charAt(i);

            if (current === "\n") {
                if (currentCol > 0) {
                    width = Math.max(width, currentCol);
                    currentRow++;
                    currentCol = 0;
                }
                continue;
            }

            let pixel: number;
            switch (current) {
                case ".":
                case "#":
                case "0":
                    pixel = 0; break;
                case "1":
                    pixel = 1; break;
                case "2":
                    pixel = 2; break;
                case "3":
                    pixel = 3; break;
                case "4":
                    pixel = 4; break;
                case "5":
                    pixel = 5; break;
                case "6":
                    pixel = 6; break;
                case "7":
                    pixel = 7; break;
                case "8":
                    pixel = 8; break;
                case "9":
                    pixel = 9; break;
                case "a":
                case "A":
                    pixel = 10; break;
                case "b":
                case "B":
                    pixel = 11; break;
                case "c":
                case "C":
                    pixel = 12; break;
                case "d":
                case "D":
                    pixel = 13; break;
                case "e":
                case "E":
                    pixel = 14; break;
                case "f":
                case "F":
                    pixel = 15; break;
                default:
                    continue;
            }

            if (values.length < currentCol + 1) {
                values.push([])
            }
            if (values[currentCol].length < currentRow + 1) {
                values[currentCol].push(0)
            }
            values[currentCol][currentRow] = pixel;
            currentCol++;
        }

        const height = values.length;

        const result = new Image(width, height);

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const col = values[x];

                if (col) {
                    if (y < col.length) {
                        result.setPixel(x, y, col[y])
                        continue;
                    }
                }
            }
        }
        return result
    }
}

//% block="Pixel Art"
//% color="#00296b"
//% icon="\uf03e"
namespace pixelArt {
    /**
     * An image.
     */
    //% blockId=minecraft_pixel_art_sprite_image
    //% block="$img"
    //% shim=TD_ID
    //% img.fieldEditor="sprite"
    //% img.fieldOptions.taggedTemplate="img"
    //% img.fieldOptions.decompileIndirectFixedInstances="true"
    //% img.fieldOptions.decompileArgumentAsString="true"
    //% weight=100 duplicateShadowOnDrag
    //% help=github:makecode-minecraft-pixel-art/docs/image
    export function _spriteImage(img: Image) {
        return img;
    }

    /**
     * Draws an image at the given location using concrete blocks.
     * @param image The image to draw
     * @param position The position to draw
     * @param direction The axis to draw along
     */
    //% blockId=minecraft_pixel_art_draw_image
    //% block="draw image $image at $position along $direction"
    //% image.shadow=minecraft_pixel_art_sprite_image
    //% position.shadow=minecraftCreatePosition
    //% weight=111
    //% help=github:makecode-minecraft-pixel-art/docs/draw-image
    export function drawImage(image: Image, position: Position, direction: CompassDirection) {
        const origin = position.toWorld();
        const colors = [
            WHITE_CONCRETE,
            RED_CONCRETE,
            PINK_CONCRETE,
            ORANGE_CONCRETE,
            YELLOW_CONCRETE,
            CYAN_CONCRETE,
            LIME_CONCRETE,
            BLUE_CONCRETE,
            LIGHT_BLUE_CONCRETE,
            MAGENTA_CONCRETE,
            GRAY_CONCRETE,
            PURPLE_CONCRETE,
            LIGHT_GRAY_CONCRETE,
            BROWN_CONCRETE,
            BLACK_CONCRETE
        ];

        const visited = new Image(image.width, image.height);

        // Greedily partition the image into rectangles to reduce the number of fill
        // operations we have to send to minecraft. This isn't optimal by any means
        for (let x = 0; x < image.width; x++) {
            for (let y = 0; y < image.height; y++) {
                if (visited.getPixel(x, y)) continue;

                const color = image.getPixel(x, y);
                visited.setPixel(x, y, 1);

                if (!color) continue;
                let width = 1;

                for (let x2 = x + 1; x2 < image.width; x2++) {
                    if (visited.getPixel(x2, y) || image.getPixel(x2, y) !== color) break;
                    width++;
                    visited.setPixel(x2, y, 1);
                }

                let height = 1;
                for (let y2 = y + 1; y2 < image.height; y2++) {
                    let invalid = false;
                    for (let i = 0; i < width; i++) {
                        if (visited.getPixel(x + i, y2) || image.getPixel(x + i, y2) !== color) {
                            invalid = true;
                            break;
                        }
                    }
                    if (invalid) break;
                    for (let i = 0; i < width; i++) {
                        visited.setPixel(x + i, y2, 1);
                    }
                    height++;
                }

                fillRect(origin, direction, colors[color - 1], x, y, width, height, image)
            }
        }
    }

    function fillRect(origin: Position, direction: number, block: number, x: number, y: number, width: number, height: number, image: Image) {
        let fromPosition: Position;
        let toPosition: Position;
        if (direction === CompassDirection.North) {
            fromPosition = world(
                origin.getValue(Axis.X),
                origin.getValue(Axis.Y) + image.height - y - 1,
                origin.getValue(Axis.Z) - x
            );
            toPosition = world(
                origin.getValue(Axis.X),
                origin.getValue(Axis.Y) + image.height - (y + height - 1) - 1,
                origin.getValue(Axis.Z) - (x + width - 1)
            );
        }
        else if (direction === CompassDirection.East) {
            fromPosition = world(
                origin.getValue(Axis.X) + x,
                origin.getValue(Axis.Y) + image.height - y - 1,
                origin.getValue(Axis.Z)
            );
            toPosition = world(
                origin.getValue(Axis.X) + (x + width - 1),
                origin.getValue(Axis.Y) + image.height - (y + height - 1) - 1,
                origin.getValue(Axis.Z)
            );
        }
        else if (direction === CompassDirection.South) {
            fromPosition = world(
                origin.getValue(Axis.X),
                origin.getValue(Axis.Y) + image.height - y - 1,
                origin.getValue(Axis.Z) + x
            );
            toPosition = world(
                origin.getValue(Axis.X),
                origin.getValue(Axis.Y) + image.height - (y + height - 1) - 1,
                origin.getValue(Axis.Z) + (x + width - 1)
            );
        }
        else {
            fromPosition = world(
                origin.getValue(Axis.X) - x,
                origin.getValue(Axis.Y) + image.height - y - 1,
                origin.getValue(Axis.Z)
            );
            toPosition = world(
                origin.getValue(Axis.X) - (x + width - 1),
                origin.getValue(Axis.Y) + image.height - (y + height - 1) - 1,
                origin.getValue(Axis.Z)
            );
        }

        blocks.fill(
            block,
            fromPosition,
            toPosition,
            FillOperation.Replace
        );
    }
}

class Image {
    protected buf: number[];

    constructor(public width: number, public height: number, public x0 = 0, public y0 = 0) {
        if (!this.width) this.width = 16;
        if (!this.height) this.height = 16;
        this.buf = [];
        for (let i = 0; i < this.width * this.height; i++) {
            this.buf.push(0);
        }
    }

    setPixel(col: number, row: number, value: number) {
        if (col < this.width && row < this.height && col >= 0 && row >= 0) {
            this.buf[col + row * this.width] = value;
        }
    }

    getPixel(col: number, row: number) {
        if (col < this.width && row < this.height && col >= 0 && row >= 0) {
            return this.buf[col + row * this.width]
        }
        return 0;
    }

    copy(col = 0, row = 0, width = this.width, height = this.height): Image {
        const sub = new Image(width, height);
        sub.x0 = col;
        sub.y0 = row;
        for (let c = 0; c < width; c++) {
            for (let r = 0; r < height; r++) {
                sub.setPixel(c, r, this.getPixel(col + c, row + r));
            }
        }
        return sub;
    }

    apply(change: Image, transparent = false) {
        let current: number;
        for (let c = 0; c < change.width; c++) {
            for (let r = 0; r < change.height; r++) {
                current = change.getPixel(c, r);

                if (!current && transparent) continue;
                this.setPixel(change.x0 + c, change.y0 + r, current);
            }
        }
    }
}
