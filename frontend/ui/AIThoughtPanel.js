class AIThoughtPanel {
    constructor(scene) {
        this.scene = scene;
        this.fragmentTimer = null;
        this.currentText = '';
        this.createUI();
    }

    createUI() {
        const width = this.scene.cameras.main.width;
        const panelX = width / 2;
        const panelY = this.scene.cameras.main.height - 90;

        this.panel = this.scene.add.rectangle(panelX, panelY, 940, 140, 0x0d1424, 0.82)
            .setStrokeStyle(2, 0x2c3a57)
            .setDepth(15);

        this.header = this.scene.add.text(panelX - 430, panelY - 58, 'RooKnight • Thought Stream', {
            fontSize: '15px',
            fontFamily: 'Space Grotesk',
            color: '#9fd6ff'
        }).setDepth(16);

        this.memoryText = this.scene.add.text(panelX - 430, panelY - 32, '', {
            fontSize: '12px',
            fontFamily: 'Space Grotesk',
            color: '#ffd7a8',
            wordWrap: { width: 860 }
        }).setDepth(16);

        this.thoughtText = this.scene.add.text(panelX - 430, panelY - 4, '', {
            fontSize: '17px',
            fontFamily: 'Space Grotesk',
            color: '#f5ead4',
            wordWrap: { width: 860 }
        }).setDepth(16);

        this.confidenceLabel = this.scene.add.text(panelX - 430, panelY + 42, 'Confidence Pulse', {
            fontSize: '12px',
            fontFamily: 'Space Grotesk',
            color: '#7c8baa'
        }).setDepth(16);

        this.confidenceBg = this.scene.add.rectangle(panelX - 430, panelY + 58, 220, 12, 0x1b2338, 0.8)
            .setOrigin(0, 0.5).setDepth(16);

        this.confidenceBar = this.scene.add.rectangle(panelX - 430, panelY + 58, 0, 12, 0x9fd6ff, 0.9)
            .setOrigin(0, 0.5).setDepth(16);

        this.confidenceValue = this.scene.add.text(panelX - 195, panelY + 48, '—', {
            fontSize: '12px',
            fontFamily: 'Space Grotesk',
            color: '#f5ead4'
        }).setDepth(16);
    }

    showThought(decision) {
        if (!decision) return;

        if (this.fragmentTimer) {
            this.fragmentTimer.remove(false);
            this.fragmentTimer = null;
        }

        const fragments = decision.fragments && decision.fragments.length
            ? decision.fragments
            : [{ stage: 'Thought', text: decision.reasoning || '' }];

        this.currentText = '';
        this.thoughtText.setText('');

        if (decision.memoryEcho) {
            const echo = typeof decision.memoryEcho === 'string' ? decision.memoryEcho : decision.memoryEcho.memory;
            this.memoryText.setText(`Memory echo → ${echo}`);
        } else {
            this.memoryText.setText('');
        }

        const confidencePercent = Math.round((decision.confidence || 0.5) * 100);
        this.confidenceBar.width = 220 * (confidencePercent / 100);
        this.confidenceBar.setFillStyle(confidencePercent > 70 ? 0x8ce8c1 : confidencePercent > 45 ? 0xffd48f : 0xff9aa8, 0.9);
        this.confidenceValue.setText(`${confidencePercent}%`);

        this.scene.tweens.add({
            targets: this.confidenceBar,
            alpha: 0.6,
            duration: 280,
            yoyo: true
        });

        const cadence = decision.cadence || [];
        let index = 0;

        const revealFragment = () => {
            if (index >= fragments.length) {
                this.fragmentTimer = null;
                return;
            }

            const fragment = fragments[index];
            const prefix = fragment.stage ? `${fragment.stage}: ` : '';
            this.currentText += `${prefix}${fragment.text}\n`;
            this.thoughtText.setText(this.currentText.trim());
            this.scene.tweens.add({
                targets: this.thoughtText,
                alpha: { from: 0.6, to: 1 },
                duration: 220
            });

            const delay = cadence[index]?.delay || 220;
            index += 1;
            this.fragmentTimer = this.scene.time.addEvent({ delay, callback: revealFragment });
        };

        revealFragment();
    }

    hide() {
        this.panel.setAlpha(0.5);
    }

    show() {
        this.panel.setAlpha(0.82);
    }
}
