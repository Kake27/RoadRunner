"use client";
import { useEffect, useRef } from "react";

export default function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let game: any;

    import("phaser").then((Phaser) => {
      class Example extends Phaser.Scene {
        private car!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody
        private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
        private wasd!: any

        private bg!: Phaser.GameObjects.TileSprite;
        private road1!: Phaser.GameObjects.TileSprite;
        private road2!: Phaser.GameObjects.TileSprite;

        private lanes = [650, 778, 900]
        private currentLane = 1

        private enemyCars!: Phaser.Physics.Arcade.Group;
        private lastSpawnTime = 0;

        preload() {
          this.load.image("background", "assets/bg.png")
          this.load.image("racecar", "assets/player/player.png");
          this.load.image("road", "assets/test.png")

          this.load.image("enemy", "assets/vehicles/yellow_wagon.png")
        }
        create() {
            
            this.bg = this.add.tileSprite(550, 300, 0, 0, "background")

            this.road1 = this.add.tileSprite(335, 300, 0, 0, "road")
            this.road2 = this.add.tileSprite(775, 300, 0, 0, "road")


            this.car = this.physics.add.image(780, 500, "racecar");
            this.car.setScale(1.25)
            this.car.setCollideWorldBounds(true)

            this.cursors = this.input.keyboard?.createCursorKeys() ?? {
              up: { isDown: false },
              down: { isDown: false },
              left: { isDown: false },
              right: { isDown: false }
            } as Phaser.Types.Input.Keyboard.CursorKeys

            this.wasd = this.input.keyboard?.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.W,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D,
            });

            this.enemyCars = this.physics.add.group();
            this.physics.add.overlap(this.car, this.enemyCars, this.handleCrash, undefined, this)
        }

        update(time: number, delta: number) {
            // movement
            this.road1.tilePositionY -= 2;    
            this.road2.tilePositionY -= 2;

            if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
              if(this.currentLane>0) {
                this.currentLane -= 1
                this.moveToLane(this.currentLane)
              }
            }

            if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
              if(this.currentLane<this.lanes.length - 1) {
                this.currentLane += 1
                this.moveToLane(this.currentLane)
              }
            }

            //spawn cars
            if(time>this.lastSpawnTime+2500) {
              this.spawnEnemies()
              this.lastSpawnTime = time;
            }

            this.enemyCars.getChildren().forEach((enemy: any) => {
              if(enemy.y>700) enemy.destroy();
            })

        }

        moveToLane(laneIndex: number) {
          this.tweens.killTweensOf(this.car)
          const targetX = this.lanes[laneIndex]
          const goleft = targetX < this.car.x

          this.tweens.add({
            targets: this.car,
            x: targetX,
            duration: 400,
            ease: "Sine.easeInOut",

            onStart: () => {
              this.tweens.add({
                targets: this.car,
                angle: goleft ? -15 : 15,
                duration: 125,
                ease: "Sine.easeOut",
              });
            },

            onComplete: () => {
              this.tweens.add({
                targets: this.car,
                angle: 0,
                duration: 150,
                ease: "Sine.easeInOut"
              });
            }

          })
        }

        spawnEnemies() {
          const availableLanes = [...this.lanes]
          Phaser.Utils.Array.Shuffle(availableLanes)

          const cars = Phaser.Math.Between(1,2)

          for (let i = 0; i < cars; i++) {
            const laneX = availableLanes.pop()!;
            const speed = Phaser.Math.Between(50, 100);

            const enemy = this.enemyCars.create(laneX, -100, "enemy") as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
            enemy.setScale(1.25);
            enemy.setVelocityY(speed);
            enemy.setImmovable(true);
          }
        }

        handleCrash(player: any, enemy: any) {
          console.log("Game over")
          this.scene.pause()
        }
      }

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 1100,
        height: 600,
        physics: { default: "arcade", arcade: { gravity: { x:0, y: 0 } } },
        scene: Example,
        parent: containerRef.current!,
      };

      game = new Phaser.Game(config);
    });

    return () => {
      if (game) game.destroy(true);
    };
  }, []);

  return <div ref={containerRef} />;
}
