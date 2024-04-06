import { _decorator, Camera, Canvas, Component, EventKeyboard, Input, input, KeyCode, Node, RigidBody, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BallMove')
export class BallMove extends Component {
    @property(RigidBody)
    public rigidbody : RigidBody | null = null;
    @property
    public speed: number = 10;
    @property(Node)
    public playerNameText: Node | null = null;
    @property(Camera)
    public camera: Camera | null = null;
    @property(Node)
    public canvas: Node | null = null;

    private force = new Vec3(0, 0, 0);

    start() {
        //JP: キーボードイベントのリスナーを追加
        //EN: Add listener for keyboard events
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown(event: EventKeyboard) {
        switch(event.keyCode) {
            case KeyCode.KEY_W:
                this.force.z = -1 * this.speed;
                break;
            case KeyCode.KEY_S:
                this.force.z = 1 * this.speed;
                break;
            case KeyCode.KEY_A:
                this.force.x = -1 * this.speed;
                break;
            case KeyCode.KEY_D:
                this.force.x = 1 * this.speed;
                break;
            case KeyCode.SPACE:
                this.rigidbody.applyImpulse(new Vec3(0, 5, 0));
                break;
        }
    }

    onKeyUp(event: EventKeyboard) {
        Vec3.zero(this.force);
    }

    protected update(dt: number): void {
        this.rigidbody.applyForce(this.force);

        //JP: ボールの上にテキストを表示
        //EN: Display text above the ball
        if (this.playerNameText) {
            let uiPos = new Vec3(0, 0, 0);
            this.camera.convertToUINode(this.node.worldPosition, this.canvas, uiPos);
            this.playerNameText.setPosition(uiPos.x, uiPos.y + 100, 0);
        }
    }

    protected onDestroy(): void {
        //JP: キーボードイベントのリスナーを削除
        //EN: Delete listener for keyboard events
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }
}


