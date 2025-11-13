(function () {
    function normalizeHex(hex, fallback = '#1a1a2e') {
        if (!hex) {
            hex = fallback;
        }
        if (!hex.startsWith('#')) {
            hex = `#${hex}`;
        }
        return hex;
    }

    function hexToColor(hex, fallback) {
        if (typeof Phaser === 'undefined' || !Phaser.Display?.Color?.HexStringToColor) {
            return { color: 0x000000 };
        }
        return Phaser.Display.Color.HexStringToColor(normalizeHex(hex, fallback));
    }

    function drawVerticalGradient(scene, { width, height, palette, depth = -20, step = 4 } = {}) {
        const gradient = scene.add.graphics();
        const top = hexToColor(palette?.[0]);
        const bottom = hexToColor(palette?.[1] || palette?.[0]);

        for (let i = 0; i <= height; i += step) {
            const color = Phaser.Display.Color.Interpolate.ColorWithColor(top, bottom, height, i);
            gradient.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1);
            gradient.fillRect(0, i, width, step);
        }

        gradient.setDepth(depth);
        return gradient;
    }

    function createMoon(scene, { x, y, radius = 80, palette, depth = -18, fillIndex = 3, strokeIndex = 4, alpha = 0.3 } = {}) {
        const fill = hexToColor(palette?.[fillIndex] || '#9fb8ff').color;
        const stroke = hexToColor(palette?.[strokeIndex] || '#ffe7b7').color;
        const moon = scene.add.circle(x, y, radius, fill, alpha);
        moon.setStrokeStyle(2, stroke, 0.7);
        moon.setDepth(depth);
        return moon;
    }

    function createMotes(scene, {
        width,
        height,
        count = 24,
        color,
        depth = -15,
        alphaRange = { min: 0.12, max: 0.32 },
        drift = { min: 30, max: 80 },
        duration = { min: 3600, max: 6200 },
        delayRange = { min: 0, max: 1200 },
        size = { width: 2, height: 8 }
    } = {}) {
        const motes = [];
        const rectWidth = size?.width ?? size ?? 2;
        const rectHeight = size?.height ?? size ?? 8;
        const fillColor = color ?? hexToColor('#9fb8ff').color;

        for (let i = 0; i < count; i++) {
            const mote = scene.add.rectangle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                rectWidth,
                rectHeight,
                fillColor,
                Phaser.Math.FloatBetween(alphaRange.min, alphaRange.max)
            );
            mote.setDepth(depth);

            scene.tweens.add({
                targets: mote,
                y: mote.y - Phaser.Math.Between(drift.min, drift.max),
                alpha: Phaser.Math.FloatBetween(alphaRange.min * 0.5, alphaRange.max),
                duration: Phaser.Math.Between(duration.min, duration.max),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: Phaser.Math.Between(delayRange.min, delayRange.max)
            });

            motes.push(mote);
        }

        return { motes };
    }

    window.MoonlitEnvironment = {
        hexToColor,
        drawVerticalGradient,
        createMoon,
        createMotes
    };
})();
